import AppLayout from "@/Layouts/AppLayout";
import { Head } from "@inertiajs/react";

const PrivacyPolicy = ({ title, privacyPolicy }) => {
    console.log(privacyPolicy.privacy_policy);
    return (
        <>
            <Head title={title} />
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div
                    className="prose prose-sm sm:prose base prose-gray max-w-none"
                    dangerouslySetInnerHTML={{
                        __html: privacyPolicy.privacy_policy.replace(/\n/g, ""),
                    }}
                />
            </div>
        </>
    );
};

PrivacyPolicy.layout = (page) => <AppLayout children={page} />;

export default PrivacyPolicy;
