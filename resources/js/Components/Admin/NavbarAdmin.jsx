export default function NavbarAdmin() {
    return (
        <div className="bg-white shadow-md p-4">
            <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">Admin Dashboard</div>
                <div className="flex items-center space-x-4">
                    <button className="text-gray-500">Notifications</button>
                    <button className="text-gray-500">Profile</button>
                </div>
            </div>
        </div>
    );
}
