import FormatRupiah from "@/Components/FormatRupiah";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { PenIcon, PlusCircleIcon, Trash2Icon } from "lucide-react";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import FormatRupiahInput from "@/Components/FormatRupiahInput";
import axios from "axios";

const Index = ({ auth, transaction, title }) => {
    const [filteredData, setFilteredData] = useState(transaction);

    const [data, setData] = useState({
        id: "",
        order_id: "",
        transaction_id: "",
        gross_amount: "",
        payment_status: "",
        payment_method_name: "",
        wa_pembeli: "",
    });

    let [modalType, setModalType] = useState("");
    let [isOpen, setIsOpen] = useState(false);

    function handleChange(e) {
        const id = e.target.id;
        const value = e.target.value;

        setData({
            ...data,
            [id]: value,
        });
    }

    function handleOpenModal(e, data) {
        setModalType(e);

        if (e === "Edit Payment Method") {
            setIsOpen(!isOpen);
            setData({
                id: data.id,
                order_id: data.order_id,
                transaction_id: data.transaction_id,
                gross_amount: data.gross_amount,
                payment_status: data.payment_status,
                payment_method_name: data.payment_method_name,
                wa_pembeli: data.wa_pembeli,
            });
        } else {
            setIsOpen(!isOpen);
        }
    }

    function handleDelete(method) {
        axios
            .delete(`/admin/payment-method/${method.id}`)
            .then(() => {
                setFilteredData((prev) =>
                    prev.filter((item) => item.id !== method.id)
                );
            })
            .catch((err) => console.log(err));
    }

    return (
        <>
            <Authenticated
                user={auth.user}
                header={
                    <div className="justify-between flex">
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {title}
                        </h2>
                        <button
                            id="modalType"
                            onClick={() =>
                                handleOpenModal("Add Payment Method")
                            }
                            className="p-2 text-center bg-blue-600 hover:bg-blue-800 text-white rounded-md flex"
                        >
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            Add
                        </button>
                    </div>
                }
            >
                <Modal
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    data={data}
                    handleChange={handleChange}
                    setData={setData}
                    modalType={modalType}
                    filteredData={filteredData}
                    setFilteredData={setFilteredData}
                />

                <Head title={title} />

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 bg-white">
                        <table className="text-center w-full">
                            <thead>
                                <tr className="border-b-4">
                                    <th className="px-6 py-2">No</th>
                                    <th className="px-6 py-2">Order ID</th>
                                    <th className="px-6 py-2">Gross Amount</th>
                                    <th className="px-6 py-2">
                                        Transaction ID
                                    </th>
                                    <th className="px-6 py-2">Wa Pembeli</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((method, i) => (
                                    <tr
                                        key={i}
                                        className="hover:cursor-pointer border-b hover:bg-gray-300"
                                    >
                                        <th className="px-6 py-2">{i + 1}</th>
                                        <td className="px-6 py-2 uppercase">
                                            {method.order_id}
                                        </td>
                                        <td className="px-6 py-2">
                                            <FormatRupiah
                                                value={method.gross_amount}
                                            />
                                        </td>
                                        <td className="px-6 py-2">
                                            {method.transaction_id}
                                        </td>
                                        <td className="px-6 py-2">
                                            {method.wa_pembeli}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() =>
                                                    handleOpenModal(
                                                        "Edit Payment Method",
                                                        method
                                                    )
                                                }
                                                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                                            >
                                                <PenIcon />
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() =>
                                                    handleDelete(method)
                                                }
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                            >
                                                <Trash2Icon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Authenticated>
        </>
    );
};

function Modal({
    data,
    isOpen,
    setIsOpen,
    maxWidth = "2xl",
    closeable = true,
    onClose = () => setIsOpen(false),
    handleChange,
    modalType,
    setData,
    filteredData,
    setFilteredData,
}) {
    const close = () => {
        if (closeable) {
            onClose();
            setData({});
        }
    };

    const maxWidthClass = {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        "2xl": "sm:max-w-2xl",
    }[maxWidth];

    function handleAdd() {
        if (!data.order_id || !data.gross_amount || !data.transaction_id) {
            alert("Semua field wajib diisi");
            return;
        }
        axios
            .post("/admin/payment-method", data)
            .then(() => {
                setFilteredData([...filteredData, data]);
                close();
            })
            .catch((err) => console.log(err));
    }

    console.log(data);
    function handleUpdate(method) {
        if (
            data.order_id.trim() === "" ||
            data.gross_amount === "" ||
            data.transaction_id === ""
        ) {
            alert("Semua field wajib diisi");
            return;
        }

        axios
            .put(`/admin/payment-method/${method.id}`, method)
            .then(() => {
                setFilteredData((prev) =>
                    prev.map((item) => (item.id === method.id ? method : item))
                );
                close();
            })
            .catch((err) => console.log(err));
    }

    return (
        <Transition show={isOpen} as={Fragment} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 flex overflow-y-auto px-4 py-6 sm:px-0 items-center z-50 transform transition-all"
                onClose={close}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-gray-500/75" />
                </Transition.Child>

                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <Dialog.Panel
                        className={`mb-6 bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:w-full sm:mx-auto ${maxWidthClass}`}
                    >
                        <div className="m-6 space-y-4">
                            <div className="text-lg font-bold">{modalType}</div>
                            <div>
                                <InputLabel value="Order ID" />
                                <TextInput
                                    id="order_id"
                                    value={data.order_id}
                                    onChange={handleChange}
                                    className="w-full"
                                    type="text"
                                />
                            </div>
                            <div>
                                <InputLabel value="Transaction ID (Midtrans)" />
                                <TextInput
                                    id="transaction_id"
                                    value={data.transaction_id}
                                    onChange={handleChange}
                                    className="w-full"
                                    type="text"
                                />
                            </div>
                            <div>
                                <InputLabel value="Gross Amount" />
                                <FormatRupiahInput
                                    id="gross_amount"
                                    value={data.gross_amount}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <InputLabel value="Payment Status" />
                                <TextInput
                                    id="payment_status"
                                    value={data.payment_status}
                                    onChange={handleChange}
                                    className="w-full"
                                    type="text"
                                />
                            </div>
                            <div>
                                <InputLabel value="Wa Pembeli" />
                                <TextInput
                                    id="wa_pembeli"
                                    value={data.wa_pembeli}
                                    onChange={handleChange}
                                    className="w-full"
                                    type="number"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end items-end ">
                            {modalType === "Edit Payment Method" ? (
                                <button
                                    className="bg-blue-500 text-center text-white p-2 rounded-md hover:bg-blue-600 m-2"
                                    onClick={() => handleUpdate(data)}
                                >
                                    Update
                                </button>
                            ) : (
                                <button
                                    className="bg-blue-500 text-center text-white p-2 rounded-md hover:bg-blue-600 m-2"
                                    onClick={() => handleAdd()}
                                >
                                    Simpan
                                </button>
                            )}
                            <button
                                className="bg-red-500 text-center text-white p-2 rounded-md hover:bg-red-600 m-2"
                                onClick={() => close()}
                            >
                                Close
                            </button>
                        </div>
                    </Dialog.Panel>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}

export default Index;
