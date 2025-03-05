import Main from "./Main";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "Create Investment | Mtaani FX",
    description: "Start investing in your future",
};

export default function () {
    return (
        <>
            <Main/>
        </>
    )
}
