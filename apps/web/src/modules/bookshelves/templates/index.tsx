"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/stores";
import { setCurrentPage } from "@/stores/shelf-slice";
import SideBar from "@/modules/bookshelves/components/shelf-sidebar";
import BookList from "@/modules/bookshelves/components/book-list";
import useUserBookQuery from "@/modules/bookshelves/hooks/use-user-book-query";
import {
    ContentNav,
} from "@/modules/layout/components/content-nav";
import { CreateShelfModal } from "@/modules/bookshelves/components/create-shelf-modal";
import {
    bookStatuses
} from "@/config/books";
import { Pagination } from "@/components/pagination";
import { Shelf, useCountUserBooksLazyQuery, useUserBooksLazyQuery } from "@/graphql/graphql";
import { BOOKS_PAGE_SIZE } from "@/lib/constants";
import { NetworkStatus } from "@apollo/client";
import { toast } from "@/hooks/use-toast";
import * as R from "ramda";
import qs from "query-string";

interface BookshelvesTemplateProps {
    librarySelections: Shelf[];
    shelfSelections: Shelf[];
    searchParams: {
        [key: string]: string | string[] | undefined
    }
}

export default function BookshelvesTemplate({ librarySelections,
    shelfSelections }: BookshelvesTemplateProps) {

    const query = useUserBookQuery();
    const [totalPages, setTotalPages] = useState(0);
    const library = useAppSelector((state) => state.shelf.library);

    const [getCount] = useCountUserBooksLazyQuery({
        onCompleted: (data) => {
            setTotalPages(Math.ceil(data!.countUserBooks / BOOKS_PAGE_SIZE))
        }
    });

    const [loadBooks, { data: booksData, networkStatus }] =
        useUserBooksLazyQuery({
            fetchPolicy: "cache-and-network",
            nextFetchPolicy: "cache-first",
            notifyOnNetworkStatusChange: true,
            onError: (error) => {
                toast({
                    title: error.message,
                    variant: "destructive",
                });
            },
            onCompleted: (data) => {
                console.log("data", data.userBooks);
                if (data && data.userBooks && data.userBooks.length === 0) {
                    toast({
                        title: "No books are here... yet",
                        variant: "destructive",
                    });
                }
            },
            errorPolicy: "all",
        });

    const books = booksData && booksData?.userBooks;
    const loading = networkStatus === NetworkStatus.loading;

    useEffect(() => {
        const loadData = async () => {

            const pagedQuery = R.mergeRight(query, {
                limit: BOOKS_PAGE_SIZE,
            });
            await loadBooks({ variables: { ...pagedQuery } });
            await getCount({ variables: { ...query } });
        };

        loadData();
    }, [query, loadBooks, getCount, library]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="w-full grid grid-cols-4 gap-6">
                <SideBar
                    librarySelections={librarySelections}
                    shelfSelections={shelfSelections}
                />
                <div className="col-span-4 xl:col-span-3 pt-1.5">

                    <BookList
                        books={books}
                        totalPages={totalPages}
                    />

                </div>
                <CreateShelfModal />
            </div >
        </>

    );
}
