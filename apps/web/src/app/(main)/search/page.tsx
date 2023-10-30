"use client";
import { cn } from "@/lib/utils";
import { dm_sefif_display } from "@/lib/fonts";
import { BookProgressCard } from "@/components/book-progress-card";
import { useSearchParams } from "next/navigation";
import { BookCard, BookInfo, BookShelves } from "@/components/book-card";
import { Pagination } from "@/components/pagination";
import { Button, buttonVariants } from "@/components/ui/button";
import { myBooksConfig } from "@/config/mybooks";
import fakeBookData from "@/lib/testData/fakeBookData";
import BookCover from "@/components/book-cover";
import { Icons } from "@/components/icons";
import { ContentNav } from "@/modules/layout/components/content-nav";

export default function SearchPage() {
    const booksData = fakeBookData;
    const search = useSearchParams();
    const searchQuery = search ? search.get("q") : null;
    const encodedSearch = encodeURIComponent(searchQuery || "");
    const resultSelections = ["All", "Title", "Author"];

    function selection(title: string) {
        return (
            <div className="text-xs bg-secondary w-[fill-available] rounded-lg p-2 cursor-pointer">
                {title}
            </div>
        );
    }
    return (
        <>
            <>
                <div className="flex-col justify-center">
                    <div className="w-full grid grid-cols-4 gap-4">
                        <div className="col-span-4 xl:col-span-3">
                            <ContentNav
                                resultText={`Found at least 200 matches for “${searchQuery}”`}
                            />
                            <hr className="mt-1 border-t-1 border-primary" />
                            <div>
                                <BookCard
                                    book={booksData[0]}
                                    content={
                                        <BookCard.BookContent
                                            image={<BookCover src={booksData[0].image} size={"sm"} />}
                                            info={<BookInfo />}
                                        />
                                    }
                                    actions={
                                        <BookCard.BookActions
                                            buttons={[
                                                <Button
                                                    className={cn(
                                                        buttonVariants({ variant: "action", size: "xs" })
                                                    )}
                                                    label="Currently Reading"
                                                    icon={<Icons.chevronDown className="h-4 w-4" />}
                                                />,
                                                <Button
                                                    className={cn(
                                                        buttonVariants({ variant: "action", size: "xs" })
                                                    )}
                                                    label="Edit"
                                                />,
                                            ]}
                                        />
                                    }
                                />
                            </div>
                        </div>
                        <div className="hidden xl:block">
                            <div className="w-full justify-between mt-8 rounded-lg flex flex-col text-sm gap-1 text-muted-foreground font-light">
                                <div className="leading-7 items-start text-primary font-semibold ">
                                    Show Results For
                                </div>
                                <hr className="mt-1 border-t-1 border-primary" />
                                {resultSelections.map((heading) => {
                                    return selection(heading);
                                })}
                            </div>
                        </div>
                    </div>
                    <Pagination
                        totalPages={10}
                    // currentPage={currentPage}
                    // setCurrentPage={setCurrentPage}
                    />
                </div>
            </>
        </>
    );
}
