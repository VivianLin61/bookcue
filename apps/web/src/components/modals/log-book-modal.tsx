"use client";
import React, { useEffect, useReducer } from "react";
import { Modal } from "@/components/ui/modal";
import useLogBookModal from "@/hooks/use-log-book-modal";
import { BOOKS_PAGE_SIZE } from "@/lib/constants";
import LogBookCard from "./log-book-card";
import { JouranlEntryModal } from "@/modules/journal/components/journal-entry-modal";
import { useJournalEntryModal } from "@/modules/journal/hooks/use-journal-entry-modal";
import useLoadBooks from "@/hooks/user-books/queries";
import { NetworkStatus } from "@apollo/client";
interface LogBookModalProps {
}

export const LogBookModal: React.FC<LogBookModalProps> = ({
}) => {
    const logBookModal = useLogBookModal();
    const journalEntryModal = useJournalEntryModal()
    const [journalEntry, setJournalEntry] = useReducer((prev: any, next: any) => {
        return { ...prev, ...next }
    }, {
        originalPage: 0,
        originalPercent: 0,
        page: 0,
        percent: 0,
        notes: "",
        date: new Date(),
    })
    const { loadBooks, booksData, networkStatus } = useLoadBooks();
    useEffect(() => {
        const loadData = async () => {
            await loadBooks({
                variables: {
                    offset: 0,
                    limit: BOOKS_PAGE_SIZE,
                    where: {
                        status: {
                            equals: "Currently Reading"
                        }
                    }
                }
            });
        };

        loadData();
    }, [loadBooks, logBookModal.isOpen]);
    const userBooks = booksData && booksData?.userBooks
    const loading = networkStatus === NetworkStatus.loading;
    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <>
            <JouranlEntryModal
                journalEntry={journalEntry}
                setJournalEntry={setJournalEntry}
                isOpen={journalEntryModal.isOpen}
                onClose={journalEntryModal.onClose}
            />
            <Modal
                isOpen={logBookModal.isOpen}
                onClose={logBookModal.onClose}
                title={"Log a Book"}
                description={"Currently Reading Books"}
            >
                {/* Display books in a list */}
                <div className="mt-2">
                    {userBooks && userBooks.length > 0 ? (
                        userBooks.map((userBook, i) => (
                            <div
                                key={i}
                                className={`py-2 flex gap-2 cursor-pointer ${i !== userBooks.length - 1 ? "border-b" : ""
                                    }`}
                            >
                                <LogBookCard userBook={userBook} />
                            </div>
                        ))
                    ) : (
                        <p>No books are currently being read.</p>
                    )}
                </div>
            </Modal ></>
    );
};
export default LogBookModal;
