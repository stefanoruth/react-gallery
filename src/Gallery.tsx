import * as React from 'react'
import { GalleryError } from './GalleryError'
import { isSameOrContains } from './helpers'

const setTranslateX = (ref: React.RefObject<HTMLDivElement>, value: string) => {
    if (ref.current) {
        ref.current.style.webkitTransform = `translateX(${value})`
        ref.current.style.transform = `translateX(${value})`
    } else {
        throw new GalleryError('Unable to slide in gallery')
    }
}

const animateTo = (ref: React.RefObject<HTMLDivElement>, value: string) => {
    const animationTime = 500

    setTransitionDelay(ref, animationTime)

    setTranslateX(ref, value)

    setTimeout(() => {
        setTransitionDelay(ref, 0)
    }, animationTime)
}

const setTransitionDelay = (ref: React.RefObject<HTMLDivElement>, value: number) => {
    if (ref.current) {
        ref.current.style.webkitTransitionDuration = `${value}ms`
        ref.current.style.transitionDuration = `${value}ms`
    }
}

export const Gallery: React.FunctionComponent<{
    className?: string
    style?: React.CSSProperties
}> = ({ ...props }) => {
    const trackRef = React.useRef<HTMLDivElement>(null)
    const selected = React.useRef(0)
    // const trackRef = React.useRef<HTMLDivElement>(null)

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

        const handler = (e: Event) => {
            // console.log('Click', e)
        }

        trackRef.current.addEventListener('click', handler)

        return () => {
            if (trackRef.current) {
                trackRef.current.removeEventListener('click', handler)
            }
        }
    }, [trackRef.current])

    React.useEffect(() => {
        if (!trackRef.current) {
            return
        }

        let currentX: number
        let initialX: number
        let xOffset: number = 0
        let dragging = false
        let dragProcentage = 0

        const sliderWidth = trackRef.current.clientWidth
        const slideCount = React.Children.count(props.children)
        const totalWidth = sliderWidth * slideCount

        const onDrag = (move: number) => {
            dragProcentage = (move / sliderWidth) * 100

            console.log({ dragProcentage })

            setTranslateX(trackRef, dragProcentage + '%')
        }

        const onDragStart = (e: MouseEvent) => {
            e.preventDefault()

            if (!trackRef.current || !e.target) {
                return
            }

            if (!isSameOrContains(trackRef.current, e.target as any)) {
                return
            }

            dragging = true

            initialX = e.clientX - xOffset

            // console.log('start', { initialX, dragging })
        }

        const onDragEnd = (e: MouseEvent) => {
            e.preventDefault()

            if (!dragging) {
                return
            }

            initialX = currentX
            dragging = false

            let slideTo: number

            if (Math.abs(dragProcentage % 100) > 50) {
                slideTo = Math.round(dragProcentage / 100) * 100
            } else {
                slideTo = Math.ceil(dragProcentage / 100) * 100
            }

            // xOffset = currentX
            xOffset = (slideTo / 100) * sliderWidth

            setTranslateX(trackRef, slideTo + '%')

            console.log('end', { initialX, dragging, xOffset })
        }

        const onDragMove = (e: MouseEvent) => {
            e.preventDefault()

            if (!dragging) {
                return
            }

            currentX = e.clientX - initialX

            // console.log('dragging', { currentX, dragging })

            onDrag(currentX)
        }

        trackRef.current.addEventListener('mousedown', onDragStart)
        trackRef.current.addEventListener('mouseup', onDragEnd)
        trackRef.current.addEventListener('mousemove', onDragMove)

        return () => {
            if (!trackRef.current) {
                return
            }

            trackRef.current.removeEventListener('mousedown', onDragStart)
            trackRef.current.removeEventListener('mouseup', onDragEnd)
            trackRef.current.removeEventListener('mousemove', onDragMove)
        }
    }, [!!trackRef.current])

    const onPrev = () => {
        selected.current--
        if (selected.current < 0) {
            selected.current = React.Children.count(props.children) - 1
        }

        const value = selected.current * -100 + '%'

        console.log('prev', { value, selected: selected.current })
        animateTo(trackRef, value)
    }

    const onNext = () => {
        selected.current++
        if (selected.current === React.Children.count(props.children)) {
            selected.current = 0
        }

        const value = selected.current * -100 + '%'

        console.log('next', { value, selected: selected.current })
        animateTo(trackRef, value)
    }

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
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                        height: '100%',
                    }}
                    ref={trackRef}>
                    {React.Children.map(props.children, (child, i) => {
                        return React.cloneElement(child as any, {
                            ['data-slide']: i,
                            style: { position: 'absolute', left: i * 100 + '%', width: '100%', userSelect: 'none' },
                        })
                    })}
                </div>
            </div>
            <div className="flex justify-between mt-2">
                <button className="p-4 bg-purple-400" onClick={onPrev}>
                    Prev
                </button>
                <button className="p-4 bg-purple-400" onClick={onNext}>
                    Next
                </button>
            </div>
        </div>
    )
}
