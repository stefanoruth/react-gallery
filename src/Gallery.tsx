import * as React from 'react'
import { GalleryError } from './GalleryError'
import { isSameOrContains } from './helpers'

export const Gallery: React.FunctionComponent<{
    className?: string
    style?: React.CSSProperties
}> = ({ ...props }) => {
    const trackRef = React.useRef<HTMLDivElement>(null)
    // const trackRef = React.useRef<HTMLDivElement>(null)

    const setTranslateX = (ref: React.RefObject<HTMLDivElement>, procentage: number) => {
        if (ref.current) {
            ref.current.style.webkitTransform = `translateX(${procentage}%)`
            ref.current.style.transform = `translateX(${procentage}%)`
        } else {
            throw new GalleryError('Unable to slide in gallery')
        }
    }

    const getCurrentSlide = () => {
        if (trackRef.current) {
            return parseInt(trackRef.current.style.transform.replace('translateX(', '').replace('%)', ''), 10)
        }
        return NaN
    }

    React.useEffect(() => {
        if (!trackRef.current) {
            return
        }

        let currentX: number
        let initialX: number
        let dragging = false

        const onDragStartEvent = (e: MouseEvent) => {
            if (!trackRef.current || !e.target) {
                return
            }

            if (!isSameOrContains(trackRef.current, e.target as any)) {
                return
            }

            dragging = true

            initialX = e.clientX

            console.log('start', { initialX, dragging })
        }

        const onDragEndEvent = (e: MouseEvent) => {
            if (!dragging) {
                return
            }

            initialX = currentX
            dragging = false

            console.log('end', { initialX, dragging })
        }

        const onDragEvent = (e: MouseEvent) => {
            if (!dragging) {
                return
            }

            currentX = e.clientX - initialX

            console.log('dragging', { currentX, dragging })
        }

        document.addEventListener('mousedown', onDragStartEvent, false)
        document.addEventListener('mouseup', onDragEndEvent, false)
        document.addEventListener('mousemove', onDragEvent, false)

        return () => {
            if (!trackRef.current) {
                return
            }

            document.removeEventListener('mousedown', onDragStartEvent, false)
            document.removeEventListener('mouseup', onDragEndEvent, false)
            document.removeEventListener('mousemove', onDragEvent, false)
        }
    }, [!!trackRef.current])

    return (
        <div
            className={props.className}
            style={{ ...{ userSelect: 'none', position: 'relative' }, ...props.style }}
            tabIndex={0}>
            <div
                style={{
                    touchAction: 'pan-y',
                    height: '100%',
                    cursor: 'grab',
                    overflow: 'hidden',
                    position: 'relative',
                }}>
                <div
                    style={{
                        WebkitTransform: 'translateX(0px)',
                        transform: 'translateX(0px)',
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                    }}
                    ref={trackRef}>
                    {React.Children.map(props.children, (child, i) => {
                        return React.cloneElement(child as any, {
                            style: { position: 'absolute', left: i * 100 + '%', width: '100%', userSelect: 'none' },
                        })
                    })}
                </div>
            </div>
        </div>
    )
}
