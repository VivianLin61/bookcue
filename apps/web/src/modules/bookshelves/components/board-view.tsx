"use client"
import React, { useEffect, useState } from 'react'
import ColumnContainer from './column-container';
import { SortOrder } from '@/graphql/graphql';
import useLoadBooks from '@/modules/bookshelves/queries/use-load-books';
import { BOOKS_PAGE_SIZE, STATUS } from '@/lib/constants';
import { ColumnWithBooks } from '../types';
import useBuildQuery from '../hooks/use-build-query';
import useScroll from '../hooks/use-scroll';
interface BoardViewProps { }


export const BoardView: React.FC<BoardViewProps> = ({ }) => {
    const [data, setData] = useState<ColumnWithBooks[]>([]);
    const statuses: string[] = Object.values(STATUS);
    const { loadBooks, networkStatus } = useLoadBooks();
    const query = useBuildQuery();

    const generateQueryFilter = (status: string, offset = 0) => {
        const whereFilter = {
            ...query.where,
            status: { equals: status }
        };

        return {
            ...query,
            offset,
            limit: BOOKS_PAGE_SIZE,
            where: whereFilter,
            orderBy: { order: SortOrder.Asc }
        };
    };

    const loadMore = async (status: number) => {
        const queryFilter = generateQueryFilter(data[status].title, data[status].books.length)
        const fetchedData = await data[status].fetchMore({
            variables: {
                ...queryFilter,
            },
        });

        if (fetchedData.data.userBooks) {
            setData(prevData => {
                const newData = [...prevData];
                newData[status] = {
                    ...newData[status],
                    books: [...newData[status].books, ...fetchedData.data.userBooks?.map((book: any) => ({
                        id: book.book?.id,
                        title: book.book?.title,
                        order: book.order,
                        status: book.status,
                        coverImage: book.book?.coverImage,
                        author: book.book.author,

                    }))],
                };
                return newData;
            });
        }
    };

    const loadBooksByStatus = async (status: string) => {
        const queryFilter = generateQueryFilter(status);

        const { data: bookData, fetchMore } = await loadBooks(
            { variables: { ...queryFilter } }
        );

        return {
            title: status,
            books: bookData?.userBooks?.map((book: any) => ({
                id: book.book?.id,
                title: book.book?.title,
                order: book.order,
                status: book.status,
                author: book.book.author,
                coverImage: book.book?.coverImage,
            })) || [],
            fetchMore,
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const promises = statuses.map(status => loadBooksByStatus(status));
                const [wantToReadItem, upNext, readingItem, readItem, abandonedItem] = await Promise.all(promises);
                setData([wantToReadItem, upNext, readingItem, readItem, abandonedItem]);
            } catch (error) {
                // Handle errors here
                console.error('Error while loading book data:', error);
            }
        };

        loadData();
    }, [loadBooks, query]);

    useScroll(() => {
        statuses.forEach((_, index) => loadMore(index));
    });
    return (
        <div className="overflow-x-auto">
            <ColumnContainer data={data} />
        </div>
    );
}
export default BoardView
