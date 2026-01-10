// resources/js/Pages/Admin/WaEngine/Index.jsx
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import {
    Activity,
    Download,
    MessageSquare,
    Phone,
    Users,
    XCircle,
    Wifi,
    WifiOff,
    AlertCircle,
    CheckCircle,
    Send,
    QrCode,
    RefreshCw,
    Trash2,
    BarChart3,
    Clock,
    Shield,
    Zap,
    Camera,
    ScanLine,
    Smartphone,
    Copy,
    Loader2,
    WifiIcon as WifiSignal,
    Eye,
    EyeOff,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const Index = ({ auth, title }) => {
    const [devices, setDevices] = useState([]);
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({
        totalSent: 0,
        totalFailed: 0,
        totalDevices: 0,
        activeDevices: 0,
        queueSize: 0,
        successRate: 0,
    });
    const [loading, setLoading] = useState({
        devices: false,
        sending: false,
        connecting: false,
        qrLoading: {},
        disconnecting: {},
    });
    const [activeTab, setActiveTab] = useState("devices");
    const [socket, setSocket] = useState(null);
    const [qrModal, setQrModal] = useState({ open: false, device: null });
    const [showScanGuide, setShowScanGuide] = useState(false);

    const [sendForm, setSendForm] = useState({
        device_id: "",
        target: "",
        message: "",
        delay: 2000,
    });

    const [newDevice, setNewDevice] = useState({
        name: "",
        type: "primary",
    });

    const API_BASE = "/api/wa-engine";
    const SOCKET_URL = process.env.WA_ENGINE_URL || "http://localhost:3000";

    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("✅ Socket connected");
            addLog({
                type: "success",
                device: "System",
                message: "Connected to WA Engine server",
            });
        });

        newSocket.on("devices_update", (devicesData) => {
            setDevices((prev) =>
                prev.map((d) => {
                    const updated = devicesData.find((ud) => ud.id === d.id);
                    return updated ? { ...d, ...updated } : d;
                })
            );
        });

        newSocket.on("qr_generated", ({ deviceId, qrImage, message }) => {
            console.log(`📱 QR generated for ${deviceId}`);

            setDevices((prev) =>
                prev.map((device) =>
                    device.id === deviceId
                        ? {
                              ...device,
                              qrImage,
                              status: "qr_ready",
                              qrGenerated: true,
                          }
                        : device
                )
            );

            setLoading((prev) => ({
                ...prev,
                qrLoading: { ...prev.qrLoading, [deviceId]: false },
            }));

            addLog({
                type: "info",
                device: "System",
                message: `QR code generated for device ${deviceId}`,
            });
        });

        newSocket.on("qr_updated", ({ deviceId, qrImage }) => {
            setDevices((prev) =>
                prev.map((device) =>
                    device.id === deviceId ? { ...device, qrImage } : device
                )
            );
        });

        newSocket.on("device_connected", ({ deviceId, number, message }) => {
            addLog({
                type: "success",
                device: "System",
                message: `📱 Device ${deviceId} connected: ${number}`,
            });

            setDevices((prev) =>
                prev.map((device) =>
                    device.id === deviceId
                        ? {
                              ...device,
                              status: "connected",
                              number,
                              qrImage: null,
                              qrGenerated: false,
                          }
                        : device
                )
            );
        });

        newSocket.on("device_status", ({ deviceId, status }) => {
            setDevices((prev) =>
                prev.map((device) =>
                    device.id === deviceId ? { ...device, status } : device
                )
            );
        });

        newSocket.on("message_queued", (data) => {
            addLog({
                type: "info",
                device: "System",
                message: `📤 Message queued (ID: ${data.taskId})`,
            });
        });

        newSocket.on("message_result", (data) => {
            addLog({
                type: data.success ? "success" : "error",
                device: "System",
                message: data.success
                    ? `✅ Message sent successfully`
                    : `❌ Message failed: ${data.error}`,
            });

            if (data.success) {
                fetchStats();
            }
        });

        newSocket.on("device_removed", ({ deviceId }) => {
            setDevices((prev) => prev.filter((d) => d.id !== deviceId));
            addLog({
                type: "warning",
                device: "System",
                message: `Device ${deviceId} removed`,
            });
        });

        newSocket.on("disconnect", () => {
            addLog({
                type: "warning",
                device: "System",
                message: "Disconnected from WA Engine server",
            });
        });

        newSocket.on("error", (error) => {
            console.error("Socket error:", error);
            addLog({
                type: "error",
                device: "System",
                message: `Socket error: ${error.message || error}`,
            });
        });

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        fetchDevices();
        fetchStats();

        const interval = setInterval(() => {
            fetchStats();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const fetchDevices = async () => {
        setLoading((prev) => ({ ...prev, devices: true }));
        try {
            const response = await axios.get(`${API_BASE}/devices`);
            if (response.data.success) {
                setDevices(response.data.devices || []);
            }
        } catch (error) {
            console.error("Error fetching devices:", error);
            addLog({
                type: "error",
                device: "System",
                message: "Failed to fetch devices from server",
            });
        } finally {
            setLoading((prev) => ({ ...prev, devices: false }));
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_BASE}/stats`);
            if (response.data.success) {
                setStats(response.data.stats.overallStats || stats);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const addLog = (log) => {
        const newLog = {
            ...log,
            id: Date.now() + Math.random(),
            timestamp: new Date(),
        };

        setLogs((prev) => [newLog, ...prev].slice(0, 100));
    };

    const addNewDevice = async () => {
        if (!newDevice.name.trim()) {
            addLog({
                type: "warning",
                device: "System",
                message: "Please enter a device name",
            });
            return;
        }

        setLoading((prev) => ({ ...prev, connecting: true }));
        try {
            const response = await axios.post(`${API_BASE}/device/add`, {
                name: newDevice.name,
                type: newDevice.type,
            });

            if (response.data.success) {
                const newDeviceData = {
                    id: response.data.deviceId,
                    name: newDevice.name,
                    status: "connecting",
                    qrImage: null,
                    qrGenerated: false,
                    number: null,
                    type: newDevice.type,
                    stats: {
                        messagesSent: 0,
                        messagesFailed: 0,
                        lastActivity: new Date(),
                    },
                };

                setDevices((prev) => [...prev, newDeviceData]);

                addLog({
                    type: "success",
                    device: newDevice.name,
                    message: "Device added. Generating QR code...",
                });

                setNewDevice({ name: "", type: "primary" });
                fetchStats();

                setTimeout(() => {
                    if (socket && socket.connected) {
                        socket.emit("request_qr", {
                            deviceId: response.data.deviceId,
                        });
                        setLoading((prev) => ({
                            ...prev,
                            qrLoading: {
                                ...prev.qrLoading,
                                [response.data.deviceId]: true,
                            },
                        }));
                    } else {
                        addLog({
                            type: "error",
                            device: "System",
                            message:
                                "Socket not connected. QR generation may fail.",
                        });
                    }
                }, 1500);
            }
        } catch (error) {
            console.error("Error adding device:", error);
            addLog({
                type: "error",
                device: "System",
                message: `Failed to add device: ${
                    error.response?.data?.error || error.message
                }`,
            });
        } finally {
            setLoading((prev) => ({ ...prev, connecting: false }));
        }
    };

    const refreshQrCode = async (deviceId) => {
        setLoading((prev) => ({
            ...prev,
            qrLoading: { ...prev.qrLoading, [deviceId]: true },
        }));

        try {
            const response = await axios.post(
                `${API_BASE}/qr/${deviceId}/refresh`
            );
            if (response.data.success && socket) {
                socket.emit("request_qr", { deviceId });
                addLog({
                    type: "info",
                    device: "System",
                    message: "Refreshing QR code...",
                });
            }
        } catch (error) {
            console.error("Error refreshing QR:", error);
            addLog({
                type: "error",
                device: "System",
                message: "Failed to refresh QR code",
            });
        } finally {
            setTimeout(() => {
                setLoading((prev) => ({
                    ...prev,
                    qrLoading: { ...prev.qrLoading, [deviceId]: false },
                }));
            }, 2000);
        }
    };

    const disconnectDevice = async (deviceId) => {
        if (!confirm("Are you sure you want to disconnect this device?"))
            return;

        setLoading((prev) => ({
            ...prev,
            disconnecting: { ...prev.disconnecting, [deviceId]: true },
        }));

        try {
            await axios.delete(`${API_BASE}/device/${deviceId}`);

            setDevices((prev) =>
                prev.map((d) =>
                    d.id === deviceId ? { ...d, status: "disconnected" } : d
                )
            );

            const device = devices.find((d) => d.id === deviceId);
            addLog({
                type: "warning",
                device: device?.name || "Device",
                message: "Device disconnected",
            });

            fetchStats();
        } catch (error) {
            console.error("Error disconnecting device:", error);
            addLog({
                type: "error",
                device: "System",
                message: "Failed to disconnect device",
            });
        } finally {
            setLoading((prev) => ({
                ...prev,
                disconnecting: { ...prev.disconnecting, [deviceId]: false },
            }));
        }
    };

    const deleteDevice = async (deviceId) => {
        if (
            !confirm(
                "Are you sure you want to permanently delete this device? All session data will be lost."
            )
        )
            return;

        try {
            await axios.delete(`${API_BASE}/device/${deviceId}`);

            setDevices((prev) => prev.filter((d) => d.id !== deviceId));

            addLog({
                type: "error",
                device: "System",
                message: "Device permanently deleted",
            });

            fetchStats();
        } catch (error) {
            console.error("Error deleting device:", error);
            addLog({
                type: "error",
                device: "System",
                message: "Failed to delete device",
            });
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!sendForm.device_id || !sendForm.target || !sendForm.message) {
            addLog({
                type: "warning",
                device: "System",
                message: "Please fill all required fields",
            });
            return;
        }

        const device = devices.find((d) => d.id === sendForm.device_id);
        if (!device || device.status !== "connected") {
            addLog({
                type: "error",
                device: device?.name || "Unknown",
                message: "Device is not connected",
            });
            return;
        }

        setLoading((prev) => ({ ...prev, sending: true }));

        try {
            const response = await axios.post(
                `${API_BASE}/send-message`,
                sendForm
            );

            if (response.data.success) {
                addLog({
                    type: "success",
                    device: device.name,
                    message: `Message queued for ${sendForm.target}`,
                });

                setDevices((prev) =>
                    prev.map((d) =>
                        d.id === device.id
                            ? {
                                  ...d,
                                  stats: {
                                      ...d.stats,
                                      messagesSent:
                                          (d.stats.messagesSent || 0) + 1,
                                  },
                              }
                            : d
                    )
                );

                setSendForm((prev) => ({ ...prev, target: "", message: "" }));

                fetchStats();
            }
        } catch (error) {
            console.error("Error sending message:", error);

            setDevices((prev) =>
                prev.map((d) =>
                    d.id === device.id
                        ? {
                              ...d,
                              stats: {
                                  ...d.stats,
                                  messagesFailed:
                                      (d.stats.messagesFailed || 0) + 1,
                              },
                          }
                        : d
                )
            );

            addLog({
                type: "error",
                device: device.name,
                message: `Failed to send: ${
                    error.response?.data?.error || error.message
                }`,
            });
        } finally {
            setLoading((prev) => ({ ...prev, sending: false }));
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "connected":
                return <Wifi className="w-4 h-4 text-green-500" />;
            case "disconnected":
                return <WifiOff className="w-4 h-4 text-red-500" />;
            case "qr_ready":
                return <QrCode className="w-4 h-4 text-yellow-500" />;
            case "connecting":
                return (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                );
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "connected":
                return "bg-green-100 text-green-800 border-green-200";
            case "disconnected":
                return "bg-red-100 text-red-800 border-red-200";
            case "qr_ready":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "connecting":
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const QRCodeDisplay = ({ device, showModal = false }) => {
        if (!device.qrImage) {
            return (
                <div className="flex flex-col items-center justify-center p-6">
                    <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                        {loading.qrLoading[device.id] ? (
                            <div className="text-center">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-2" />
                                <p className="text-sm text-gray-600">
                                    Generating QR...
                                </p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">
                                    QR code not available
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => refreshQrCode(device.id)}
                        disabled={loading.qrLoading[device.id]}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading.qrLoading[device.id] ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        {loading.qrLoading[device.id]
                            ? "Generating..."
                            : "Generate QR Code"}
                    </button>
                </div>
            );
        }

        return (
            <div className={`${showModal ? "p-2" : "space-y-4"}`}>
                <div className="relative">
                    <img
                        src={device.qrImage}
                        alt="WhatsApp QR Code"
                        className={`${
                            showModal ? "w-72 h-72" : "w-48 h-48"
                        } mx-auto rounded-lg border-4 border-white shadow-xl`}
                    />
                    <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                        <QrCode className="w-5 h-5 text-blue-600" />
                    </div>
                </div>

                {!showModal && (
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">
                            Scan with WhatsApp to connect
                        </p>
                        <div className="flex justify-center space-x-2">
                            <button
                                onClick={() => refreshQrCode(device.id)}
                                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Refresh
                            </button>
                            <button
                                onClick={() =>
                                    setQrModal({ open: true, device })
                                }
                                className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                                <Eye className="w-3 h-3 mr-1" />
                                Enlarge
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const ScanGuideModal = () => (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                            How to Scan QR Code
                        </h3>
                        <button
                            onClick={() => setShowScanGuide(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-bold">
                                    1
                                </span>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    Open WhatsApp
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Open WhatsApp on your mobile phone
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-bold">
                                    2
                                </span>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    Go to Settings
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Tap ⋮ (three dots) → Linked Devices
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-bold">
                                    3
                                </span>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    Scan QR Code
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Tap "Link a Device" and scan the QR code
                                    above
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-bold">
                                    4
                                </span>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    Wait for Connection
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Wait for the device status to change to
                                    "Connected"
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <button
                            onClick={() => setShowScanGuide(false)}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Got it, thanks!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const QRCodeModal = () => (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {qrModal.device?.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Scan this QR code with WhatsApp
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                setQrModal({ open: false, device: null })
                            }
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>

                    <QRCodeDisplay device={qrModal.device} showModal={true} />

                    <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-center space-x-4">
                            <button
                                onClick={() => refreshQrCode(qrModal.device.id)}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh QR
                            </button>
                            <button
                                onClick={() => setShowScanGuide(true)}
                                className="flex-1 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                How to Scan
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                const link = document.createElement("a");
                                link.href = qrModal.device.qrImage;
                                link.download = `whatsapp-qr-${qrModal.device.id}.png`;
                                link.click();
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center justify-center"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download QR Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <Authenticated
            user={auth.user}
            header={
                <div className="justify-between flex items-center">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {title}
                        </h2>
                        <p className="text-sm text-gray-600">
                            WhatsApp Gateway with QR Code Support
                        </p>
                    </div>
                    <button
                        onClick={() => fetchDevices()}
                        disabled={loading.devices}
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50"
                    >
                        {loading.devices ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        <span>
                            {loading.devices
                                ? "Refreshing..."
                                : "Refresh Devices"}
                        </span>
                    </button>
                </div>
            }
        >
            <Head title={title} />

            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Messages Sent
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.totalSent}
                                    </p>
                                </div>
                                <MessageSquare className="w-10 h-10 text-green-500 p-2 bg-green-50 rounded-lg" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Active Devices
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.activeDevices}/
                                        {stats.totalDevices}
                                    </p>
                                </div>
                                <Users className="w-10 h-10 text-blue-500 p-2 bg-blue-50 rounded-lg" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Success Rate
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.successRate}%
                                    </p>
                                </div>
                                <BarChart3 className="w-10 h-10 text-purple-500 p-2 bg-purple-50 rounded-lg" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Queue Size
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.queueSize}
                                    </p>
                                </div>
                                <Clock className="w-10 h-10 text-amber-500 p-2 bg-amber-50 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                        <div className="border-b border-gray-200">
                            <nav
                                className="flex space-x-8 px-6"
                                aria-label="Tabs"
                            >
                                {[
                                    {
                                        id: "devices",
                                        label: "Devices",
                                        icon: (
                                            <Smartphone className="w-4 h-4" />
                                        ),
                                    },
                                    {
                                        id: "send",
                                        label: "Send Message",
                                        icon: <Send className="w-4 h-4" />,
                                    },
                                    {
                                        id: "logs",
                                        label: "System Logs",
                                        icon: <Activity className="w-4 h-4" />,
                                    },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? "border-blue-500 text-blue-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-6">
                            {/* Devices Tab */}
                            {activeTab === "devices" && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                WhatsApp Devices Management
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Add devices and scan QR codes to
                                                connect WhatsApp accounts
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newDevice.name}
                                                    onChange={(e) =>
                                                        setNewDevice({
                                                            ...newDevice,
                                                            name: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder="Device name..."
                                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                                                />
                                                <select
                                                    value={newDevice.type}
                                                    onChange={(e) =>
                                                        setNewDevice({
                                                            ...newDevice,
                                                            type: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="primary">
                                                        Primary
                                                    </option>
                                                    <option value="backup">
                                                        Backup
                                                    </option>
                                                    <option value="marketing">
                                                        Marketing
                                                    </option>
                                                </select>
                                            </div>
                                            <button
                                                onClick={addNewDevice}
                                                disabled={loading.connecting}
                                                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center"
                                            >
                                                {loading.connecting ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Plus className="w-4 h-4 mr-2" />
                                                )}
                                                {loading.connecting
                                                    ? "Adding..."
                                                    : "Add Device"}
                                            </button>
                                        </div>
                                    </div>

                                    {devices.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <Smartphone className="w-12 h-12 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                No Devices Added
                                            </h3>
                                            <p className="text-gray-500 mb-6">
                                                Add your first WhatsApp device
                                                to get started
                                            </p>
                                            <button
                                                onClick={addNewDevice}
                                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                                            >
                                                <Plus className="w-5 h-5 mr-2" />
                                                Add Your First Device
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {devices.map((device) => (
                                                <div
                                                    key={device.id}
                                                    className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between mb-6">
                                                        <div className="flex items-center space-x-4">
                                                            <div
                                                                className={`p-3 rounded-lg ${
                                                                    device.type ===
                                                                    "primary"
                                                                        ? "bg-blue-100 text-blue-600"
                                                                        : device.type ===
                                                                          "backup"
                                                                        ? "bg-green-100 text-green-600"
                                                                        : "bg-purple-100 text-purple-600"
                                                                }`}
                                                            >
                                                                <Smartphone className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center space-x-2">
                                                                    <h4 className="font-semibold text-gray-900">
                                                                        {
                                                                            device.name
                                                                        }
                                                                    </h4>
                                                                    <span
                                                                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                                                            device.status
                                                                        )}`}
                                                                    >
                                                                        {
                                                                            device.status
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-500">
                                                                    ID:{" "}
                                                                    {device.id.substring(
                                                                        0,
                                                                        8
                                                                    )}
                                                                    ...
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            {device.status ===
                                                            "connected" ? (
                                                                <button
                                                                    onClick={() =>
                                                                        disconnectDevice(
                                                                            device.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        loading
                                                                            .disconnecting[
                                                                            device
                                                                                .id
                                                                        ]
                                                                    }
                                                                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg disabled:opacity-50"
                                                                    title="Disconnect"
                                                                >
                                                                    {loading
                                                                        .disconnecting[
                                                                        device
                                                                            .id
                                                                    ] ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <WifiOff className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                device.status ===
                                                                    "qr_ready" && (
                                                                    <button
                                                                        onClick={() =>
                                                                            refreshQrCode(
                                                                                device.id
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            loading
                                                                                .qrLoading[
                                                                                device
                                                                                    .id
                                                                            ]
                                                                        }
                                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                                                                        title="Refresh QR"
                                                                    >
                                                                        {loading
                                                                            .qrLoading[
                                                                            device
                                                                                .id
                                                                        ] ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <RefreshCw className="w-4 h-4" />
                                                                        )}
                                                                    </button>
                                                                )
                                                            )}
                                                            <button
                                                                onClick={() =>
                                                                    deleteDevice(
                                                                        device.id
                                                                    )
                                                                }
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {device.status ===
                                                    "connected" ? (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="bg-white p-4 rounded-lg">
                                                                    <p className="text-xs text-gray-600">
                                                                        WhatsApp
                                                                        Number
                                                                    </p>
                                                                    <div className="flex items-center mt-1">
                                                                        <p className="font-mono text-sm font-semibold text-gray-900">
                                                                            {device.number ||
                                                                                "Not connected"}
                                                                        </p>
                                                                        {device.number && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(
                                                                                        device.number
                                                                                    );
                                                                                    addLog(
                                                                                        {
                                                                                            type: "success",
                                                                                            device: "System",
                                                                                            message:
                                                                                                "Phone number copied to clipboard",
                                                                                        }
                                                                                    );
                                                                                }}
                                                                                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                                                                                title="Copy number"
                                                                            >
                                                                                <Copy className="w-3 h-3" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white p-4 rounded-lg">
                                                                    <p className="text-xs text-gray-600">
                                                                        Last
                                                                        Activity
                                                                    </p>
                                                                    <p className="text-sm font-semibold text-gray-900">
                                                                        {device
                                                                            .stats
                                                                            ?.lastActivity
                                                                            ? formatTime(
                                                                                  device
                                                                                      .stats
                                                                                      .lastActivity
                                                                              )
                                                                            : "Never"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                                                                    <p className="text-xs text-green-600">
                                                                        Messages
                                                                        Sent
                                                                    </p>
                                                                    <p className="text-xl font-bold text-green-900">
                                                                        {device
                                                                            .stats
                                                                            ?.messagesSent ||
                                                                            0}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
                                                                    <p className="text-xs text-red-600">
                                                                        Messages
                                                                        Failed
                                                                    </p>
                                                                    <p className="text-xl font-bold text-red-900">
                                                                        {device
                                                                            .stats
                                                                            ?.messagesFailed ||
                                                                            0}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : device.status ===
                                                      "qr_ready" ? (
                                                        <div className="space-y-4">
                                                            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <p className="text-sm font-medium text-gray-700">
                                                                        Scan QR
                                                                        Code:
                                                                    </p>
                                                                    <button
                                                                        onClick={() =>
                                                                            setShowScanGuide(
                                                                                true
                                                                            )
                                                                        }
                                                                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                                                    >
                                                                        <ScanLine className="w-3 h-3 mr-1" />
                                                                        How to
                                                                        scan?
                                                                    </button>
                                                                </div>
                                                                <QRCodeDisplay
                                                                    device={
                                                                        device
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-sm text-gray-500">
                                                                    QR code will
                                                                    expire in 5
                                                                    minutes
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-100 p-6 rounded-lg text-center">
                                                            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-3">
                                                                {getStatusIcon(
                                                                    device.status
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600">
                                                                Device is{" "}
                                                                {device.status}
                                                            </p>
                                                            {device.status ===
                                                                "connecting" && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Preparing
                                                                    connection...
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Send Message Tab */}
                            {activeTab === "send" && (
                                <div className="max-w-3xl mx-auto">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                        Send WhatsApp Message
                                    </h3>
                                    <form
                                        onSubmit={sendMessage}
                                        className="space-y-6"
                                    >
                                        <div className="bg-gray-50 p-5 rounded-xl">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Select WhatsApp Device *
                                            </label>
                                            <select
                                                value={sendForm.device_id}
                                                onChange={(e) =>
                                                    setSendForm((prev) => ({
                                                        ...prev,
                                                        device_id:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                                required
                                            >
                                                <option value="">
                                                    -- Choose connected device
                                                    --
                                                </option>
                                                {devices
                                                    .filter(
                                                        (d) =>
                                                            d.status ===
                                                            "connected"
                                                    )
                                                    .map((device) => (
                                                        <option
                                                            key={device.id}
                                                            value={device.id}
                                                        >
                                                            📱 {device.name} (
                                                            {device.number}) -{" "}
                                                            {device.stats
                                                                ?.messagesSent ||
                                                                0}{" "}
                                                            messages sent
                                                        </option>
                                                    ))}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Only connected devices can send
                                                messages
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 p-5 rounded-xl">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Target Phone Number *
                                            </label>
                                            <div className="flex">
                                                <span className="bg-gray-200 px-4 py-3.5 rounded-l-lg border border-r-0 border-gray-300 text-gray-700 font-medium">
                                                    +62
                                                </span>
                                                <input
                                                    type="text"
                                                    value={sendForm.target}
                                                    onChange={(e) =>
                                                        setSendForm((prev) => ({
                                                            ...prev,
                                                            target: e.target
                                                                .value,
                                                        }))
                                                    }
                                                    placeholder="8123456789"
                                                    className="flex-1 px-4 py-3.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Format: 8123456789 (without +62)
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 p-5 rounded-xl">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Message Content *
                                            </label>
                                            <textarea
                                                value={sendForm.message}
                                                onChange={(e) =>
                                                    setSendForm((prev) => ({
                                                        ...prev,
                                                        message: e.target.value,
                                                    }))
                                                }
                                                rows={6}
                                                placeholder="Enter your message here... (Max 4096 characters)"
                                                className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                maxLength={4096}
                                                required
                                            />
                                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                                <span>
                                                    💡 Tip: Use clear and
                                                    concise messages
                                                </span>
                                                <span>
                                                    {sendForm.message.length}
                                                    /4096
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-5 rounded-xl">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                ⚡ Anti-Banned Protection
                                            </label>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-sm text-gray-600">
                                                            Delay between
                                                            messages
                                                        </span>
                                                        <span className="ml-2 font-semibold text-blue-600">
                                                            {sendForm.delay}ms
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded ${
                                                            sendForm.delay <
                                                            1500
                                                                ? "bg-red-100 text-red-800"
                                                                : sendForm.delay <
                                                                  3000
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-green-100 text-green-800"
                                                        }`}
                                                    >
                                                        {sendForm.delay < 1500
                                                            ? "Risky"
                                                            : sendForm.delay <
                                                              3000
                                                            ? "Moderate"
                                                            : "Safe"}
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="500"
                                                    max="10000"
                                                    step="500"
                                                    value={sendForm.delay}
                                                    onChange={(e) =>
                                                        setSendForm((prev) => ({
                                                            ...prev,
                                                            delay: parseInt(
                                                                e.target.value
                                                            ),
                                                        }))
                                                    }
                                                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                                                />
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Fast (500ms)</span>
                                                    <span className="font-medium">
                                                        Recommended (2000ms)
                                                    </span>
                                                    <span>Safe (10000ms)</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-3">
                                                ⚠️ Lower delay may trigger
                                                WhatsApp rate limiting
                                            </p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading.sending}
                                            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-semibold text-lg flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                        >
                                            {loading.sending ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>
                                                        Sending Message...
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    <span>
                                                        Send WhatsApp Message
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Logs Tab */}
                            {activeTab === "logs" && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Real-time System Logs
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Monitor all activities and
                                                messages
                                            </p>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => setLogs([])}
                                                className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                Clear All Logs
                                            </button>
                                            <button
                                                onClick={() => fetchDevices()}
                                                className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 hover:bg-blue-50 rounded-lg flex items-center space-x-1"
                                            >
                                                <RefreshCw className="w-3 h-3" />
                                                <span>Refresh</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900 rounded-xl p-4 h-[500px] overflow-y-auto font-mono">
                                        {logs.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center">
                                                <Activity className="w-16 h-16 text-gray-700 mb-4" />
                                                <p className="text-gray-500">
                                                    No logs yet. Activities will
                                                    appear here.
                                                </p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    Start by adding a device or
                                                    sending a message
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {logs.map((log) => (
                                                    <div
                                                        key={log.id}
                                                        className="flex items-start space-x-3 p-3 hover:bg-gray-800/50 rounded-lg transition-colors"
                                                    >
                                                        <div className="flex-shrink-0 mt-1">
                                                            {log.type ===
                                                            "success" ? (
                                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                            ) : log.type ===
                                                              "error" ? (
                                                                <XCircle className="w-4 h-4 text-red-500" />
                                                            ) : log.type ===
                                                              "warning" ? (
                                                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                                                            ) : (
                                                                <Activity className="w-4 h-4 text-blue-500" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-3 mb-1">
                                                                <span className="text-xs text-gray-400">
                                                                    {formatTime(
                                                                        log.timestamp
                                                                    )}
                                                                </span>
                                                                <span
                                                                    className={`text-xs px-2 py-1 rounded ${
                                                                        log.type ===
                                                                        "success"
                                                                            ? "bg-green-900/50 text-green-300"
                                                                            : log.type ===
                                                                              "error"
                                                                            ? "bg-red-900/50 text-red-300"
                                                                            : log.type ===
                                                                              "warning"
                                                                            ? "bg-yellow-900/50 text-yellow-300"
                                                                            : "bg-blue-900/50 text-blue-300"
                                                                    }`}
                                                                >
                                                                    {log.type.toUpperCase()}
                                                                </span>
                                                                <span className="text-blue-300 text-sm font-medium truncate">
                                                                    [
                                                                    {log.device}
                                                                    ]
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-200 text-sm leading-relaxed">
                                                                {log.message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {qrModal.open && <QRCodeModal />}

            {/* Scan Guide Modal */}
            {showScanGuide && <ScanGuideModal />}
        </Authenticated>
    );
};

export default Index;

// Add missing icon component
const Plus = ({ className }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4v16m8-8H4"
        />
    </svg>
);
