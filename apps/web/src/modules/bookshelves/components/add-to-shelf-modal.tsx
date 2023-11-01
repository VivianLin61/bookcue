"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";

import { Modal } from "@/components/ui/modal";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "../../../components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import useAddToShelfModal from "@/modules/bookshelves/hooks/use-add-to-shelf-modal";
import { Button } from "../../../components/ui/button";
import useUserBook from "@/stores/use-user-book";
import { useUpdateUserBookMutation } from "@/graphql/graphql";
import { useAppDispatch, useAppSelector } from "@/stores";
import { incrementShelfCount, selectShelves } from "@/stores/shelf-slice";

interface AddToShelfModalProps { }

export const AddToShelfModal: React.FC<AddToShelfModalProps> = () => {
    const addToShelfModal = useAddToShelfModal();
    // const { shelves, incrementShelfCount } = ;
    const dispath = useAppDispatch();
    const shelves = useAppSelector(selectShelves)

    const userBook = useUserBook();
    const [UpdateUserBook] = useUpdateUserBookMutation();

    const displayFormSchema = z.object({
        shelves: z.array(z.string()).refine((value) => value.some((item) => item), {
            message: "You have to select at least one item.",
        }),
    });

    type DisplayFormValues = z.infer<typeof displayFormSchema>;

    const form = useForm<DisplayFormValues>({
        resolver: zodResolver(displayFormSchema),
        defaultValues: useMemo(() => {
            return {
                shelves: userBook.shelves.map((item) => item.shelf.name),
            };
        }, [userBook.shelves]),
    });

    useEffect(() => {
        form.reset({ shelves: userBook.shelves.map((item) => item.shelf.name) });
    }, [userBook.shelves]);

    async function onSubmit({ shelves }: DisplayFormValues) {
        const { data } = await UpdateUserBook({
            variables: {
                data: {
                    shelves,
                },
                where: {
                    id: userBook.bookId,
                },
            },
        });

        if (data) {
            toast({
                title: `Sucessfully added ${data.updateUserBook.book?.title} to shelves`,
            });

            shelves.map((item) => {
                console.log("shelf name", item);
                dispath(incrementShelfCount({ name: item }))
            });
        } else {
            toast({
                title: "Error updating book!",
            });
        }
        addToShelfModal.onClose();
    }

    return (
        <Modal
            title={"Add book to shelves"}
            description="Add a new shelf to organize your books."
            isOpen={addToShelfModal.isOpen}
            onClose={addToShelfModal.onClose}
        >
            <Form {...form}>
                <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="shelves"
                        render={() => (
                            <FormItem>
                                {shelves.map((item) => (
                                    <FormField
                                        key={item.name}
                                        control={form.control}
                                        name="shelves"
                                        render={({ field }) => {
                                            return (
                                                <FormItem
                                                    key={item.name}
                                                    className="flex flex-row shelves-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(item.name)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...field.value, item.name])
                                                                    : field.onChange(
                                                                        field.value?.filter(
                                                                            (value) => value !== item.name
                                                                        )
                                                                    );
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {item.name}
                                                    </FormLabel>
                                                </FormItem>
                                            );
                                        }}
                                    />
                                ))}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="space-x-2 flex items-center justify-end w-full">
                        <Button
                            label="Cancel"
                            //   disabled={loading}
                            variant="outline"
                            onClick={addToShelfModal.onClose}
                        ></Button>
                        <Button
                            type="submit"
                            label="Add"
                            //   disabled={loading}
                            variant="default"
                        >
                            Add
                        </Button>
                    </div>
                </form>
            </Form>
        </Modal>
    );
};
