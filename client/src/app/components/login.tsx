import {
    Dispatch,
    SetStateAction,
    ChangeEvent,
    KeyboardEvent,
    MouseEvent,
} from "react"

interface LoginTextInputProps {
    name?: string
    value: string
    setValue: Dispatch<SetStateAction<string>>
    type: string
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
}

export const LoginTextInput = ({
    name,
    value,
    setValue,
    type,
    onKeyDown,
}: LoginTextInputProps) => {
    const inputStyle = "w-full text-lg p-2 rounded border-2 border-gray-400"
    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
    }
    return (
        <input
            name={name ? name : ""}
            type={type}
            className={inputStyle}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
        />
    )
}

interface LoginButtonProps {
    label: string
    onClick: (e: MouseEvent<any>) => void
}

export const LoginButton = ({ label, onClick }: LoginButtonProps) => {
    return (
        <button
            type="submit"
            className="font-bold p-2 rounded bg-green-300 cursor-pointer hover:bg-green-200"
            onClick={onClick}
        >
            {label}
        </button>
    )
}
