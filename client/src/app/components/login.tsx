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

interface LoginTextAreaInputProps {
    name?: string
    value: string
    setValue: Dispatch<SetStateAction<string>>
    onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void
}

export const LoginTextAreaInput = ({
    name,
    value,
    setValue,
    onKeyDown,
}: LoginTextAreaInputProps) => {
    const inputStyle = "w-full text-lg p-2 rounded border-2 border-gray-400"
    const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value)
    }
    return (
        <textarea
            name={name ? name : ""}
            className={inputStyle}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
        />
    )
}

interface LoginButtonProps {
    label: string
    onClick: (e: MouseEvent<HTMLButtonElement>) => void
    disabled?: boolean
}

export const LoginButton = ({
    label,
    onClick,
    disabled = false,
}: LoginButtonProps) => {
    return (
        <button
            type="submit"
            className="font-bold p-2 rounded bg-green-300 cursor-pointer hover:bg-green-200 disabled:bg-green-100 disabled:cursor-not-allowed"
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>
    )
}
