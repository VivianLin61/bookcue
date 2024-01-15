import { Input } from '@/components/ui/input';
import React from 'react';
interface ShelfInputProps {
    deleteShelf: (shelf: string) => void;
    onAddShelf: (shelf: string) => void;
    tags: string[];
    shelfList?: any;
    setShelfList?: any;
    setShelfName: any;
    shelfName: any;
    input: any;

}
export const ShelfInput: React.FC<ShelfInputProps> = ({
    deleteShelf,
    onAddShelf,
    tags,
    setShelfName,
    input,
    shelfName,
    shelfList,
    setShelfList,
}) => {
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter' && event.target.value !== "") {
            event.preventDefault();
            onAddShelf(event.target.value)
            // Clear the input
            input.onChange("")
            setShelfName("")
        }
        if (event.key === 'Backspace' && event.target.value === "") {
            event.preventDefault();
            deleteShelf(tags[tags.length - 1])
        }
    };
    // clicking on a value should reset the input
    React.useEffect(() => {
        setShelfName(String(input.value));
    }, [input.value, setShelfName]);


    const filterShelfList = (searchValue: string) => {
        if (shelfList && setShelfList) {
            const filteredList = shelfList.filter((shelf: any) =>
                shelf.name.toLowerCase().includes(searchValue.toLowerCase())
            );
            setShelfList(filteredList);
        }
    };

    return (
        <div className="mb-4 text-sm">
            <ul className="flex flex-wrap p-1 mt-2 border border-gray-300 rounded">
                {tags.map((tag, index) => (
                    <li
                        key={index}
                        className="bg-secondary text-primary rounded px-2 py-1 m-1 flex items-center"
                    >
                        {tag}

                        <span
                            className="ml-2 focus:outline-none cursor-pointer"
                            onClick={e => deleteShelf(tag)}
                        >
                            &#x2716;{" "}
                        </span>
                    </li>
                ))}
                <li className="flex-1">
                    <Input
                        className="w-full px-2 py-1 focus:outline-none bg-white border-none"
                        onKeyDown={handleKeyPress}
                        disabled={false}
                        ref={input.ref}
                        value={shelfName}
                        onChange={(e) => {
                            input.onChange(e.target.value); // send data to hook form
                            setShelfName(e.target.value);
                            filterShelfList(e.target.value);
                        }}
                        onBlur={input.onBlur}

                    />

                </li>
            </ul>
        </div>
    );
};

export default ShelfInput;
