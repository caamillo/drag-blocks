import { ReactNode } from "react"

export type ResizeElement = {
    target?:    ReactNode,
    width?:     [ number, Function ],
    height?:    [ number, Function ],
    direction?: 'top' | 'right' | 'bottom' | 'left',
    position?:  [ Cursor, Function ]
}

export type Cursor = {
    x:  number,
    y:  number
}