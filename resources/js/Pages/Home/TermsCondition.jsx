import AppLayout from "@/Layouts/AppLayout";
import { Head } from "@inertiajs/react";

const TermsCondition = ({ title, termsCondition }) => {
    return (
        <>
            <Head title={title} />
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div
                    className="prose prose-sm sm:prose base prose-gray max-w-none"
                    dangerouslySetInnerHTML={{
                        __html: termsCondition.terms_condition.replace(
                            /\n/g,
                            ""
                        ),
                    }}
                />
            </div>
        </>
    );
};

TermsCondition.layout = (page) => <AppLayout children={page} />;

export default TermsCondition;
