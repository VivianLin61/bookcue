import { BookResult } from "@/components/book-result";
import { ContentNav } from "@/components/content-nav";
import { Pagination } from "@/components/pagination";
import { Button, buttonVariants } from "@/components/ui/button";
import { myBooksConfig } from "@/config/mybooks";
import { authOptions } from "@/lib/auth/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import React from "react";

interface MyBooksPageProps {
  params: { bookId: string };
}

export default async function MyBooksPage({ params }: MyBooksPageProps) {
  const user = await getCurrentUser();
  const totalPages = 10;
  // const [currentPage, setCurrentPage] = React.useState(0);
  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login");
  }

  return (
    <>
      <div className="flex-col justify-center">
        <div className="w-full grid grid-cols-4 gap-4">
          <div className="hidden xl:block">
            <div className="w-full justify-between mt-8 rounded-lg flex flex-col text-sm text-muted-foreground font-light">
              <div className="leading-7 items-start text-primary font-semibold ">
                Bookshelves
              </div>
              <hr className="mt-1 border-t-1 border-primary" />
              <div className="bg-secondary text-xs mt-4 w-[fill-available] rounded-lg p-2 cursor-pointer">
                Read
              </div>
              <div className="text-xs w-[fill-available] rounded-lg p-2 cursor-pointer">
                Want to Read
              </div>
              <div className="text-xs w-[fill-available] rounded-lg p-2 cursor-pointer">
                Currently Reading
              </div>
              <Button className="mt-2" size={"sm"}>
                Add Shelf
              </Button>
            </div>
            <div className="w-full justify-between mt-8 rounded-lg flex flex-col gap-1 text-sm text-muted-foreground font-light">
              <div className="items-start text-primary font-semibold">
                Tools
              </div>
              <hr className="mt-1 border-t-1 border-primary" />
              <div className=" mt-2 text-xs bg-secondary w-[fill-available] rounded-lg p-2 cursor-pointer">
                Export Books
              </div>
              <div className="text-xs bg-secondary w-[fill-available] rounded-lg p-2 cursor-pointer">
                Import Books
              </div>
            </div>
            <div className="w-full justify-between mt-8 rounded-lg flex flex-col gap-1 text-sm text-muted-foreground font-light">
              <div className=" mt-2 items-start text-primary font-semibold">
                Add A Book
              </div>
              <hr className="mt-1 border-t-1 border-primary" />
              <div className="text-xs bg-secondary w-[fill-available] rounded-lg p-2 cursor-pointer">
                Search Books
              </div>
            </div>
          </div>
          <div className="col-span-4 xl:col-span-3">
            <ContentNav
              nav={myBooksConfig.contentNav}
              sorting={myBooksConfig.sortingSelects}
            />
            <hr className="mt-1 border-t-1 border-primary" />
            <div>
              <BookResult />
              <BookResult />
              <BookResult />
            </div>
          </div>
        </div>
        <Pagination
          totalPages={totalPages}
          // currentPage={currentPage}
          // setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
}
