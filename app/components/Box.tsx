'use client'

import {
    useState,
    useContext,
    ReactElement,
    useRef,
    useEffect,
    Reference
} from "react"

import { FloorContext } from "../context/FloorContext"
import { v4 as uuidv4 } from 'uuid'
import { Cursor } from "../types"

type BoxProps = {
    children?:      ReactElement,
    Width:          number,
    Height:         number,
    Position?:      Cursor,
    Draggable?:     boolean,
    AnchorRef?:     object
}

export default function Box({
    children,
    Width,
    Height,
    Position = { x: 0, y: 0 },
    Draggable = true,
    AnchorRef
} : BoxProps) {

    const { TileSize, Gap, setResizing, resizing, cursor, checkCollisions } = useContext(FloorContext)
    const [ vWidth, setViewWidth ] = useState(Width)
    const [ vHeight, setViewHeight ] = useState(Height)
    const [ vPosition, setViewPosition ] = useState(Position)
    const [ isFocus, setIsFocus ] = useState(false)
    const [ isDragging, setIsDragging ] = useState(false)

    const boxRef = useRef<HTMLDivElement>(null)

    const bindResized = (direction: string) =>
        setResizing({
            target:     boxRef.current,
            width:      [ vWidth, setViewWidth ],
            height:     [ vHeight, setViewHeight ],
            position:   [ vPosition, setViewPosition ],
            direction
        })

    const isResizing = (direction: string) =>
        resizing?.target?.id === boxRef.current?.id &&
            resizing?.direction === direction

    const hoverHandler = (direction: string, to_parent=false) => {
        const getTarget = (e) =>
            to_parent
                ? e.currentTarget.parentElement
                : e.currentTarget
        return {
            onMouseEnter: (e) => {
                if (!resizing?.target)
                    getTarget(e)?.setAttribute('data-resizing', 'true')
            },
            onMouseLeave: (e) => {
                if (resizing?.direction !== direction)
                    getTarget(e)?.setAttribute('data-resizing', 'false')
            }
        }
    }

    useEffect(() => {
        if (resizing?.target?.id !== boxRef?.current?.id)
            return setIsFocus(false)
        setIsFocus(true)
    }, [resizing])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !boxRef.current) return;
            let mid = AnchorRef?.current || e.currentTarget
            mid = {
                x: mid.offsetWidth / 2,
                y: mid.offsetHeight / 2
            }

            const DRAG_OFFSET_X = 200
            const { clientX, clientY } = e

            const adjusted_x = clientX - mid.x - DRAG_OFFSET_X
            const adjusted_y = clientY - mid.y

            const move_x = Math.round(adjusted_x / (TileSize + Gap));
            const move_y = Math.round(adjusted_y / (TileSize + Gap));

            if (checkCollisions({ x1: move_x, x2: move_x + vWidth, y1: move_y, y2: move_y + vHeight }))
                setViewPosition({
                    x: move_x,
                    y: move_y,
                });
        };

        const handleMouseUp = () => {
            if (isDragging) onDragEnd();
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, cursor, TileSize])

    const onDrag = (e: React.MouseEvent) => {
        if (!Draggable) return
        setIsDragging(true)
        bindResized('*')
    }

    const onDragEnd = () => {
        setIsDragging(false)
        setResizing({})
    }

    return (
        <div
            data-block
            id={`box-${ uuidv4() }`}
            ref={boxRef}
            style={{
                width:  `${ TileSize * vWidth + (Gap * (vWidth - 1)) }px`,
                height: `${ TileSize * vHeight + (Gap * (vHeight - 1)) }px`,
                top:    `${ TileSize * vPosition.y + (Gap * vPosition.y) }px`,
                left:   `${ TileSize * vPosition.x + (Gap * vPosition.x) }px`
            }}
            data-focus={ isFocus }
            data-coordinates={ JSON.stringify(vPosition) }
            data-size={ JSON.stringify({ width: vWidth, height: vHeight }) }
            className="absolute w-full h-full z-10
            transition-all duration-150 ease-in-out
            data-[focus=true]:opacity-80"
        >
            <div
                onMouseDown={ onDrag }
                className="absolute top-1/2 left-1/2
                -translate-x-1/2 -translate-y-1/2 size-20
                rounded-full outline outline-2 outline-black/30
                cursor-move z-20"
            ></div>
            <div
                data-resizing={ isResizing('bottom-right') }
                className="group/corner absolute bottom-0 right-0 w-full h-full"
            >
                <div
                    { ...hoverHandler('right') }
                    data-resizing={ isResizing('right') }
                    onMouseDown={ () => bindResized('right') }
                    className="absolute right-0 top-0 z-20 h-full w-[20px] bg-gradient-to-r from-transparent to-blue-500 cursor-e-resize rounded-r-md opacity-0 data-[resizing=true]:opacity-100 group-data-[resizing=true]/corner:opacity-100 transition-opacity duration-300 ease-in-out"
                ></div>
                <div
                    { ...hoverHandler('bottom') }
                    data-resizing={ isResizing('bottom') }
                    onMouseDown={ () => bindResized('bottom') }
                    className="absolute bottom-0 left-0 z-20 h-[20px] w-full bg-gradient-to-b from-transparent to-blue-500 cursor-s-resize rounded-b-md opacity-0 data-[resizing=true]:opacity-100 group-data-[resizing=true]/corner:opacity-100 transition-opacity duration-300 ease-in-out"
                ></div>
                <div
                    { ...hoverHandler('bottom-right', true) }
                    onMouseDown={ () => bindResized('bottom-right') }
                    className="absolute size-4 bottom-0 right-0 cursor-se-resize z-20"
                >
                </div>
            </div>
            <div
                data-resizing={ isResizing('bottom-left') }
                className="group/corner absolute bottom-0 left-0 w-full h-full"
            >
                <div
                    { ...hoverHandler('left') }
                    data-resizing={ isResizing('left') }
                    onMouseDown={ () => bindResized('left') }
                    className="absolute left-0 top-0 z-20 h-full w-[20px] bg-gradient-to-l from-transparent to-blue-500 cursor-w-resize rounded-l-md opacity-0 data-[resizing=true]:opacity-100 group-data-[resizing=true]/corner:opacity-100 transition-opacity duration-300 ease-in-out"
                ></div>
                <div
                    { ...hoverHandler('bottom') }
                    data-resizing={ isResizing('bottom') }
                    className="absolute bottom-0 left-0 h-[20px] w-full bg-gradient-to-b from-transparent to-blue-500 cursor-s-resize rounded-b-md opacity-0 data-[resizing=true]:opacity-100 group-data-[resizing=true]/corner:opacity-100 transition-opacity duration-300 ease-in-out"
                ></div>
                <div
                    { ...hoverHandler('bottom-left', true) }
                    onMouseDown={ () => bindResized('bottom-left') }
                    className="absolute size-4 bottom-0 left-0 cursor-sw-resize z-20"
                >
                </div>
            </div>
            <div
                data-resizing={ isResizing('top-left') }
                className="group/corner absolute top-0 left-0 w-full h-full"
            >
                <div
                    { ...hoverHandler('left') }
                    data-resizing={ isResizing('left') }
                    className="absolute left-0 top-0 h-full w-[20px] bg-gradient-to-l from-transparent to-blue-500 cursor-w-resize rounded-l-md opacity-0 data-[resizing=true]:opacity-100 group-data-[resizing=true]/corner:opacity-100 transition-opacity duration-300 ease-in-out"
                ></div>
                <div
                    { ...hoverHandler('top') }
                    data-resizing={ isResizing('top') }
                    onMouseDown={ () => bindResized('top') }
                    className="absolute top-0 left-0 z-20 h-[20px] w-full bg-gradient-to-t from-transparent to-blue-500 cursor-n-resize rounded-t-md opacity-0 data-[resizing=true]:opacity-100 group-data-[resizing=true]/corner:opacity-100 transition-opacity duration-300 ease-in-out"
                ></div>
                <div
                    { ...hoverHandler('top-left', true) }
                    onMouseDown={ () => bindResized('top-left') }
                    className="absolute size-4 top-0 left-0 cursor-nw-resize z-20"
                >
                </div>
            </div>
            <div
                data-resizing={ isResizing('top-right') }
                className="group/corner absolute top-0 right-0 w-full h-full"
            >
                <div
                    { ...hoverHandler('right') }
                    data-resizing={ isResizing('right') }
                    className="absolute right-0 top-0 h-full w-[20px] bg-gradient-to-r from-transparent to-blue-500 cursor-e-resize rounded-r-md opacity-0 data-[resizing=true]:opacity-100 group-data-[resizing=true]/corner:opacity-100 transition-opacity duration-300 ease-in-out"
                ></div>
                <div
                    { ...hoverHandler('top') }
                    data-resizing={ isResizing('top') }
                    className="absolute top-0 right-0 h-[20px] w-full bg-gradient-to-t from-transparent to-blue-500 cursor-n-resize rounded-t-md opacity-0 data-[resizing=true]:opacity-100 group-data-[resizing=true]/corner:opacity-100 transition-opacity duration-300 ease-in-out"
                ></div>
                <div
                    { ...hoverHandler('top-right', true) }
                    onMouseDown={ () => bindResized('top-right') }
                    className="absolute size-4 top-0 right-0 cursor-ne-resize z-20"
                >
                </div>
            </div>
            { children }
        </div>
    )
}