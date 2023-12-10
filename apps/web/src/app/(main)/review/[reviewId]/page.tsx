import React from "react";
import { getShelves } from "@/modules/bookshelves/api/getShelves";
import { getCurrentUser } from "@/lib/auth/session";
import ReviewTemplate from "@/modules/review/templates";
import { notFound } from "next/navigation";
import { getReview } from "@/modules/review/api/getReview";

interface ReviewPageProps {
    params: { reviewId: string };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
    const { shelves } = await getShelves();
    const review = await getReview(params.reviewId);
    if (!review || !review.book) {
        return notFound();
    }
    const user = await getCurrentUser();
    return (
        <>
            <ReviewTemplate reviewId={params.reviewId} book={review.book} shelves={shelves} user={user} />
        </>
    );
}
