import * as React from 'react'
// import { GalleryError } from './GalleryError'
// import { isSameOrContains } from './helpers'
// import { throttle } from 'lodash'

export interface GalleryApi {
    next: () => void
    prev: () => void
}

const setTranslateX = (ref: React.RefObject<HTMLDivElement>, value: number) => {
    if (!ref.current) {
        return
    }

    ref.current.style.webkitTransform = `translateX(${value}%)`
    ref.current.style.transform = `translateX(${value}%)`
}

const setTransitionDelay = (ref: React.RefObject<HTMLDivElement>, value: number) => {
    if (ref.current) {
        ref.current.style.webkitTransitionDuration = `${value}ms`
        ref.current.style.transitionDuration = `${value}ms`
    }
}

const setLeft = (elm: HTMLElement, value: number) => {
    elm.style.left = `${value}%`
}

export const Gallery: React.FunctionComponent<{
    className?: string
    style?: React.CSSProperties
    api?: (api: GalleryApi) => void
    onSlideChange?: (slideIndex: number) => void
}> = ({ ...props }) => {
    const trackRef = React.useRef<HTMLDivElement>(null)
    const selected = React.useRef(0)
    const isAnimating = React.useRef(false)
    const animationTime = 500

    const animateTo = (value: number) => {
        isAnimating.current = true
        setTransitionDelay(trackRef, animationTime)

        setTranslateX(trackRef, value)

        setTimeout(() => {
            setTransitionDelay(trackRef, 0)
        }, animationTime)
    }

    const slideCount = () => {
        if (!trackRef.current) {
            return 0
        }

        return trackRef.current.children.length
    }

    React.useEffect(() => {
        if (props.api) {
            const api: GalleryApi = {
                next: onNext,
                prev: onPrev,
            }

            props.api(api)
        }
    }, [props.api])

    React.useEffect(() => {
        // if (!trackRef.current) {
        //     return
        // }
        // let currentX: number
        // let initialX: number
        // let xOffset: number = 0
        // let dragging = false
        // let dragProcentage = 0
        // const sliderWidth = trackRef.current.clientWidth
        // const slideCount = React.Children.count(props.children)
        // const totalWidth = sliderWidth * slideCount
        // const onDrag = (move: number) => {
        //     dragProcentage = (move / sliderWidth) * 100
        //     console.log({ dragProcentage })
        //     setTranslateX(trackRef, dragProcentage + '%')
        // }
        // const onDragStart = (e: MouseEvent) => {
        //     e.preventDefault()
        //     if (!trackRef.current || !e.target) {
        //         return
        //     }
        //     if (!isSameOrContains(trackRef.current, e.target as any)) {
        //         return
        //     }
        //     dragging = true
        //     initialX = e.clientX - xOffset
        //     // console.log('start', { initialX, dragging })
        // }
        // const onDragEnd = (e: MouseEvent) => {
        //     e.preventDefault()
        //     if (!dragging) {
        //         return
        //     }
        //     initialX = currentX
        //     dragging = false
        //     let slideTo: number
        //     if (Math.abs(dragProcentage % 100) > 50) {
        //         slideTo = Math.round(dragProcentage / 100) * 100
        //     } else {
        //         slideTo = Math.ceil(dragProcentage / 100) * 100
        //     }
        //     // xOffset = currentX
        //     xOffset = (slideTo / 100) * sliderWidth
        //     const currentSlide = Math.abs(xOffset / sliderWidth)
        //     selected.current = currentSlide
        //     console.log({ currentSlide, xOffset, sliderWidth })
        //     setTranslateX(trackRef, slideTo + '%')
        //     console.log('end', { initialX, dragging, xOffset })
        // }
        // const onDragMove = (e: MouseEvent) => {
        //     e.preventDefault()
        //     if (!dragging) {
        //         return
        //     }
        //     currentX = e.clientX - initialX
        //     // console.log('dragging', { currentX, dragging })
        //     onDrag(currentX)
        // }
        // trackRef.current.addEventListener('mousedown', onDragStart)
        // trackRef.current.addEventListener('mouseup', onDragEnd)
        // trackRef.current.addEventListener('mousemove', onDragMove)
        // return () => {
        //     if (!trackRef.current) {
        //         return
        //     }
        //     trackRef.current.removeEventListener('mousedown', onDragStart)
        //     trackRef.current.removeEventListener('mouseup', onDragEnd)
        //     trackRef.current.removeEventListener('mousemove', onDragMove)
        // }
    }, [!!trackRef.current])

    const slideFlow = (callback: (elm: HTMLDivElement) => (() => void) | void) => () => {
        if (!trackRef.current) {
            return
        }

        if (isAnimating.current) {
            return
        }

        isAnimating.current = true

        const reset = callback(trackRef.current)

        if (props.onSlideChange) {
            props.onSlideChange(selected.current)
        }

        setTimeout(() => {
            if (reset) {
                reset()
            }

            if (isAnimating.current) {
                isAnimating.current = false
            }
        }, animationTime)
    }

    const onPrev = slideFlow(elm => {
        selected.current--

        if (selected.current < 0) {
            const lastChild: HTMLElement | null = elm.children[slideCount() - 1] as any

            if (!lastChild) {
                return
            }

            setLeft(lastChild, -100)

            animateTo(100)

            selected.current = slideCount() - 1

            return () => {
                setLeft(lastChild, (slideCount() - 1) * 100)
                setTranslateX(trackRef, selected.current * -100)
            }
        }

        animateTo(selected.current * -100)
    })

    const onNext = slideFlow(elm => {
        selected.current++

        if (selected.current === slideCount()) {
            const firstChild: HTMLElement | null = elm.children[0] as any

            if (!firstChild) {
                return
            }

            setLeft(firstChild, slideCount() * 100)

            animateTo(selected.current * -100)

            selected.current = 0

            return () => {
                setLeft(firstChild, 0)
                setTranslateX(trackRef, 0)
            }
        }

        animateTo(selected.current * -100)
    })

    return (
        <div
            className={props.className}
            style={{
                ...{
                    touchAction: 'pan-y',
                    height: '100%',
                    cursor: 'grab',
                    overflow: 'hidden',
                    position: 'relative',
                    userSelect: 'none',
                },
                ...props.style,
            }}
            tabIndex={0}>
            <div
                style={{
                    WebkitTransform: 'translateX(0px)',
                    transform: 'translateX(0px)',
                    position: 'absolute',
                    left: 0,
                    top: 0,
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
    )
}
