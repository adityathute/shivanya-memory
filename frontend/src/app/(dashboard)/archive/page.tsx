import Archive from "./Archive";

export const metadata = {
    title: "Archive",
    description:
        "View and restore your archived notes, tasks, lists, and goals in Memory.",

    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
        },
    },
};

export default function Page() {
    return <Archive />;
}