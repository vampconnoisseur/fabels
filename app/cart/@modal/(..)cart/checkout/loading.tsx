import Modal from "@/app/components/Modal";

const PAGE = async () => {
  return (
    <Modal>
      <div className="flex flex-col justify-center items-center" style={{ height: '75vh' }}>
        <div className="loader"></div>
      </div>
    </Modal>
  );
};

export default PAGE;