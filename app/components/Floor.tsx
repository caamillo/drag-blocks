'use client'

import {
    ReactElement,
    useEffect,
    useRef,
    useState,
    useContext
} from "react"
import { ResizeElement, Cursor } from "../types"

import { FloorContextProvider } from "../context/FloorContext"

type FloorProps = {
    children?:  ReactElement,
    TileSize?:  number,
    Gap?:       number
}

type Bounding = {
    x1: number, x2: number,
    y1: number, y2: number
}

export default function Floor({
    children,
    TileSize = 60,
    Gap = 8
} : FloorProps) {

    const [ columns, setColumns ] = useState(0)
    const [ rows, setRows ] = useState(0)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [ resizing, setResizing ] = useState<ResizeElement>({})
    const cursor = useRef<Cursor>({ x: -1, y: -1 })
    const [ grayMap, setGrayMap ] = useState([])
    
    const getBoundings = (block: Element, width: number, height: number): Bounding => {
        const fcorner = JSON.parse(block?.getAttribute('data-coordinates'))
        const lcorner = {
            x: fcorner?.x + width,
            y: fcorner?.y + height - 1
        }

        return {
            x1: fcorner.x,
            x2: lcorner.x,
            y1: fcorner.y,
            y2: lcorner.y
        }
    }

    const getTakenTilesByBoundings = (boundings: Bounding) => {
        const grid = []
        for (let i = boundings.y1; i < boundings.y2; i++)
            for (let j = boundings.x1; j < boundings.x2; j++)
                grid.push({ x: j, y: i })
        return grid
    }

    const checkCollisions = (boundings: Bounding, countResizing=false) => {
        const tiles = getTakenTilesByBoundings(boundings)

        if (!!tiles.some(tile => tile.x > columns || tile.y > rows))
            return false

        const blocks = [
            ...document.querySelectorAll(`[data-block]${ !countResizing ? `:not(#${ resizing?.target?.id })` : '' }`)
        ]

        for (let block of blocks) {
            const { width, height } = JSON.parse(block.getAttribute('data-size'))
            const _boundings = getBoundings(block, width, height)
            const _tiles = getTakenTilesByBoundings(_boundings)

            for (let { x, y } of tiles) {
                const element = _tiles.find(tile =>
                    tile.x === x &&
                    tile.y === y
                )
                if (!element) continue
                else return false
            }
        }

        return true
    }

    useEffect(() => {console.log(grayMap)}, [grayMap])

    useEffect(() => {
        if (!rows || !columns) return

        const map = []
        for (let y = 0; y < rows; y++) {
            map.push([])
            for (let x = 0; x < columns; x++)
                map.at(-1)?.push(Math.floor(Math.random() * 70) + 20)
        }
        setGrayMap(map)     
    }, [rows, columns])

    useEffect(() => {
        const handle = () => {
            if (!resizing?.target || !resizing?.direction) return

            const { left, right, width, top, bottom, height } = resizing.target.getBoundingClientRect()
            const [ vWidth, setViewWidth ] = resizing.width
            const [ vHeight, setViewHeight ] = resizing.height
            const [ vPosition, setViewPosition ] = resizing.position
            const { x, y } = cursor.current

            const directions = resizing.direction.split('-')

            const updateWidth = (drag_x: number, from_left=false) => {
                let new_w_pixels = width + drag_x
                if (new_w_pixels < (TileSize + Gap)) new_w_pixels = (TileSize + Gap)
                
                const new_w = Math.round(new_w_pixels / (TileSize + Gap))
                const boundings = getBoundings(resizing?.target, new_w, vHeight)

                if (checkCollisions(boundings))
                    if (from_left)
                        setViewPosition(old_pos => ({ ...old_pos, x: vWidth - (new_w - vWidth) }))
                    setViewWidth(new_w)
            }

            const updateHeight = (drag_y: number, from_top=false) => {
                let new_h_px = height + drag_y
                if (new_h_px < (TileSize + Gap)) new_h_px = TileSize + Gap

                const new_h = Math.round(new_h_px / (TileSize + Gap))
                const boundings = getBoundings(resizing?.target, vWidth, new_h)

                if (checkCollisions(boundings))
                    if (from_top)
                        setViewPosition(old_pos => ({ ...old_pos, y: vHeight - (new_h - vHeight) }))
                    setViewHeight(new_h)
            }

            for (let direction of directions)
                switch (direction) {
                    case 'top':
                        updateHeight(y - top, true)
                        break
                    case 'right':
                        updateWidth(x - right)
                        break
                    case 'bottom':
                        updateHeight(y - bottom)
                        break
                    case 'left':
                        updateWidth(x - left, true)
                        break
                }
        }

        const t = setInterval(handle, 100)
        return () =>
            clearInterval(t)
    })

    useEffect(() => {
        const handle = ({ clientX, clientY }) => {
            cursor.current.x = clientX
            cursor.current.y = clientY
        }

        document.addEventListener('mousemove', handle)
        return () =>
            document.removeEventListener('mousemove', handle)
    })

    useEffect(() => {
        const handle = () => {
            if (!resizing?.target) return
            setResizing({})
        }
        document.addEventListener('mouseup', handle)
        return () =>
            document.removeEventListener('mouseup', () => handle)
    })

    useEffect(() => {
        if (!wrapperRef.current) return

        setColumns(
            Math.round(
                (wrapperRef.current?.offsetWidth ?? 0) / (TileSize + Gap)
            )
        )
        setRows(
            Math.round(
                (wrapperRef.current?.offsetHeight ?? 0) / (TileSize + Gap)
            )
        )
    }, [wrapperRef])

    return (
        <FloorContextProvider checkCollisions={checkCollisions} cursor={cursor} TileSize={TileSize} Gap={Gap} resizing={resizing} setResizing={setResizing}>
            <div className="container h-screen flex flex-wrap relative">
                <div
                    ref={wrapperRef}
                    style={{ gap: `${Gap}px` }}
                    data-show={ !!resizing?.target }
                    className="absolute flex flex-wrap w-full h-full z-10
                    opacity-0 data-[show=true]:opacity-100 transition-opacity duration-300 ease-in-out"
                >
                    {
                        new Array(rows)
                            .fill(0).map(
                                (_, y) =>
                                    new Array(columns)
                                        .fill(0)
                                        .map(
                                            (_, x) =>
                                                <div
                                                    key={y+x}
                                                    style={{
                                                        width:      `${ TileSize }px`,
                                                        height:     `${ TileSize }px`,
                                                        opacity:    `${ grayMap?.[y]?.[x] }%`
                                                    }}
                                                    className="data-[focus=true]:bg-blue-300/50 bg-slate-300/50 rounded-md">
                                                </div>
                                        )
                            )
                    }
                </div>
                <div className="flex gap-2">
                    { children }
                </div>
            </div>
        </FloorContextProvider>
    )
}