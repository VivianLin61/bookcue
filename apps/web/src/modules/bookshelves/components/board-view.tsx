"use client"
import React, { useEffect, useState } from 'react'
import ColumnContainer from './column-container';
import useLoadBooks from '@/modules/bookshelves/queries/use-load-books';
import { STATUS } from '@/lib/constants';
import { ColumnWithBooks } from '../types';
import useBuildQuery from '../hooks/use-build-query';
import { generateQueryFilter } from '../utils';
interface BoardViewProps { }


export const BoardView: React.FC<BoardViewProps> = ({ }) => {
    const [data, setData] = useState<ColumnWithBooks[]>([]);
    const statuses: string[] = Object.values(STATUS);
    const { loadBooks, networkStatus } = useLoadBooks();
    const query = useBuildQuery();


    const loadBooksByStatus = async (status: string) => {
        const queryFilter = generateQueryFilter(query, status);

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

    return (
        <div className="overflow-x-auto">
            <ColumnContainer data={data} setData={setData} />
        </div>
    );
}
export default BoardView
