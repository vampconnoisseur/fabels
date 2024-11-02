"use client";

import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { fetchBookSales, fetchUserByEmail } from '@/app/lib/data';
import { ChartData, CategoryScale, LinearScale, Chart, ArcElement, BarElement, Tooltip, Title, Legend } from 'chart.js';
import 'chartjs-plugin-datalabels';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import { redirect } from 'next/navigation';

Chart.register(CategoryScale, LinearScale, ArcElement, BarElement, Title, Legend, Tooltip);

interface SalesData {
    [bookId: string]: SalesDataEntry;
}

interface SalesDataEntry {
    title: string;
    sales: number;
    price: number;
    averageRating: number | null;
}

interface CustomChartData extends ChartData<'bar' | 'pie', (number | null)[], unknown> {
    datasets: ChartDataset[];
}

interface ChartDataset {
    label: string;
    data: (number | null)[];
    backgroundColor: string | string[];
    borderColor: string;
    borderWidth: number;
}

const SalesPage = () => {
    const [salesData, setSalesData] = useState<SalesData>({});
    const [chartData, setChartData] = useState<CustomChartData>({ labels: [], datasets: [] });
    const [averageRatingData, setAverageRatingData] = useState<CustomChartData>({ labels: [], datasets: [] });
    const [revenueShareData, setRevenueShareData] = useState<CustomChartData>({ labels: [], datasets: [] });
    const [authorizationStatus, setAuthorizationStatus] = useState<"loading" | "unauthorized" | "authorized">("loading");
    const [totalRevenue, setTotalRevenue] = useState(0);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            redirect("/");
        }

        const checkAdminStatus = async () => {
            if (session?.user?.email) {
                try {
                    const user = await fetchUserByEmail(session.user.email);
                    if (user?.isAdmin) {
                        setAuthorizationStatus("authorized");
                        await getSalesData();
                    } else {
                        setAuthorizationStatus("unauthorized");
                        toast({
                            title: "Unauthorized",
                            description: "You do not have permission to access this page.",
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user:", error);
                    setAuthorizationStatus("unauthorized");
                }
            } else {
                setAuthorizationStatus("loading");
            }
        };

        checkAdminStatus();
    }, [status, session]);

    useEffect(() => {
        if (authorizationStatus === "authorized" && Object.keys(salesData).length > 0) {
            const labels = Object.values(salesData).map(entry => entry.title || 'Unknown Title');
            const sales = labels.map((_, index) => salesData[Object.keys(salesData)[index]].sales);
            const totalRevenueList = labels.map((_, index) => salesData[Object.keys(salesData)[index]].price);
            const averageRatings = labels.map((_, index) => salesData[Object.keys(salesData)[index]].averageRating || 0);

            setTotalRevenue(totalRevenueList.reduce((sum, rev) => sum + rev, 0));

            setChartData({
                labels,
                datasets: [
                    {
                        label: 'Number of Sales',
                        data: sales,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: 'Total Revenue',
                        data: totalRevenueList,
                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1,
                    },
                ],
            });

            setAverageRatingData({
                labels,
                datasets: [
                    {
                        label: 'Average Rating',
                        data: averageRatings,
                        backgroundColor: 'rgba(255, 206, 86, 0.6)',
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 1,
                    },
                ],
            });

            const totalRevenueSum = totalRevenueList.reduce((sum, rev) => sum + rev, 0);
            setRevenueShareData({
                labels,
                datasets: [
                    {
                        label: 'Revenue Share',
                        data: totalRevenueList.map(rev => (totalRevenueSum > 0 ? (rev / totalRevenueSum) * 100 : 0)),
                        backgroundColor: labels.map((_, index) => `hsl(${index * 40}, 100%, 50%)`),
                        borderColor: 'rgba(0, 0, 0, 0.2)',
                        borderWidth: 1,
                    },
                ],
            });
        }
    }, [salesData, authorizationStatus]);

    const getSalesData = async () => {
        const data = await fetchBookSales();
        setSalesData(data as SalesData);
    };

    if (authorizationStatus === "loading") {
        return (
            <div className="flex flex-col min-h-screen justify-center items-center">
                <div className="loader"></div>
            </div>
        );
    }

    if (authorizationStatus === "unauthorized") {
        return <div>Unauthorized Access.</div>;
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen p-6">
            <h1 className="text-4xl font-bold mb-8 text-black">Book Sales Overview</h1>
            <h2 className="text-2xl font-semibold mb-12 text-black">Total Revenue: ${totalRevenue.toFixed(2)}</h2>

            {chartData.labels!.length > 0 ? (
                <Bar
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Sales and Revenue per Book',
                                font: {
                                    size: 20,
                                },
                            },
                        },
                    }}
                    width={800}
                    height={500}
                />
            ) : (
                <p className="text-gray-600">No transactions.</p>
            )}

            <div className="mt-12" />

            {averageRatingData.labels!.length > 0 ? (
                <Bar
                    data={averageRatingData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Average Rating per Book',
                                font: {
                                    size: 20,
                                },
                            },
                        },
                    }}
                    width={800}
                    height={500}
                />
            ) : (
                <p className="text-gray-600">No transactions.</p>
            )}

            <div className="mt-12" />

            <div className='w-3/4'>
                {revenueShareData.labels!.length > 0 ? (
                    <Pie
                        data={revenueShareData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: 'Revenue Share by Book',
                                    font: {
                                        size: 20,
                                    },
                                },
                            },
                        }}
                        width={150}
                        height={150}
                    />
                ) : (
                    <p className="text-gray-600 text-center">No transactions.</p>
                )}
            </div>
        </div>
    );
};

export default SalesPage;