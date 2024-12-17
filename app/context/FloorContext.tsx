import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef
} from "react"
import { Cursor, ResizeElement } from "../types"

type FloorContextType = {
    TileSize: number;
    Gap: number;
};

export const FloorContext = createContext<FloorContextType | undefined>(undefined);

type FloorContextProviderProps = {
    TileSize?:          number
    Gap?:               number
    children?:          ReactNode,
    resizing?:          ResizeElement,
    setResizing:        Function,
    cursor:             Cursor,
    checkCollisions:    Function
}

export function FloorContextProvider({
    TileSize = 60,
    Gap = 8,
    children,
    resizing,
    setResizing,
    cursor,
    checkCollisions
}: FloorContextProviderProps) {

    return (
        <FloorContext.Provider value={{ TileSize, Gap, resizing, setResizing, cursor, checkCollisions }}>
            {children}
        </FloorContext.Provider>
    );
}

export function useFloorContext() {
    const context = useContext(FloorContext)
    if (!context) {
        throw new Error("useFloorContext must be used within a FloorContextProvider");
    }
    return context;
}