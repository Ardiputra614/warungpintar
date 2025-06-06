import AdminLayout from "@/Layouts/AdminLayout";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
const Page = () => {
    return (
        <>
            <AdminLayout>
                <StudioEditor
                    options={{
                        // ...
                        project: {
                            type: "web",
                            // The default project to use for new projects
                            default: {
                                pages: [
                                    {
                                        name: "Home",
                                        component: "<h1>Home page</h1>",
                                    },
                                    {
                                        name: "About",
                                        component: "<h1>About page</h1>",
                                    },
                                    {
                                        name: "Contact",
                                        component: "<h1>Contact page</h1>",
                                    },
                                ],
                            },
                        },
                    }}
                />
            </AdminLayout>
        </>
    );
};

export default Page;
