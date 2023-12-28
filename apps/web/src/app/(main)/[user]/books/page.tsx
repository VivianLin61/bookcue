import { getShelves } from "@/modules/shelf/queries/getShelves";
import SideBar from "@/modules/shelf/components/shelf-sidebar";
import BookshelvesTemplate from "@/modules/bookshelves/templates";
import React from "react";

interface BookshelvesPageProps { }

export default async function BooksPage({ }: BookshelvesPageProps) {
    const { library, shelves } = await getShelves();
    return (
        <>
            <div className="w-full grid grid-cols-4 gap-6">
                <SideBar
                    librarySelections={library}
                    shelfSelections={shelves}
                />
                <BookshelvesTemplate />
            </div >
        </>
    );
}
