import * as React from 'react'
import { isSameOrContains } from './helpers'

export interface GalleryApi {
    next: () => void
    prev: () => void
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

    const setTranslateX = (value: number) => {
        if (trackRef.current) {
            trackRef.current.style.webkitTransform = `translateX(${value}%)`
            trackRef.current.style.transform = `translateX(${value}%)`
        }
    }

    const setTransitionDelay = (value: number) => {
        if (trackRef.current) {
            trackRef.current.style.webkitTransitionDuration = `${value}ms`
            trackRef.current.style.transitionDuration = `${value}ms`
        }
    }

    const wrapPrev = () => {
        if (!trackRef.current) {
            return () => {}
        }

        const lastChild: HTMLElement | null = trackRef.current.children[slideCount() - 1] as any

        if (!lastChild) {
            return () => {}
        }

        setLeft(lastChild, -100)

        return () => {
            setLeft(lastChild, (slideCount() - 1) * 100)
        }
    }

    const wrapNext = () => {
        if (!trackRef.current) {
            return () => {}
        }

        const firstChild: HTMLElement | null = trackRef.current.children[0] as any

        if (!firstChild) {
            return () => {}
        }

        setLeft(firstChild, slideCount() * 100)

        return () => {
            setLeft(firstChild, 0)
        }
    }

    const animateTo = (value: number) => {
        isAnimating.current = true
        setTransitionDelay(animationTime)

        setTranslateX(value)

        setTimeout(() => {
            setTransitionDelay(0)
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
        if (!trackRef.current) {
            return
        }

        let currentX: number
        let initialX: number
        let xOffset: number = 0
        let dragging = false
        let drag = 0
        let dragDir: 'prev' | 'next' | undefined
        let wrapped: boolean = false
        let finishSlide: undefined | (() => void)

        const setFinish = (method: () => void) => {
            if (finishSlide) {
                finishSlide = () => {
                    if (finishSlide) {
                        finishSlide()
                    }
                    method()
                }
            } else {
                finishSlide = method
            }
        }

        const slideWidth = parseInt(window.getComputedStyle(trackRef.current).width, 10)
        const totalWidth = slideWidth * slideCount()

        const onDragStart = (e: MouseEvent) => {
            const { clientX } = e
            e.preventDefault()

            if (!trackRef.current || !e.target) {
                return
            }

            if (!isSameOrContains(trackRef.current, e.target as any)) {
                return
            }

            xOffset =
                (slideWidth *
                    parseInt(trackRef.current.style.transform.replace('translateX(', '').replace('%)', ''), 10)) /
                100

            dragging = true
            initialX = clientX - xOffset
            console.log('start', { initialX, xOffset, clientX, slideWidth, totalWidth })
        }

        const onDragMove = (e: MouseEvent) => {
            const { clientX } = e
            e.preventDefault()

            if (!dragging) {
                return
            }

            currentX = clientX - initialX
            drag = (currentX / slideWidth) * 100

            if (currentX === 0) {
                dragDir = undefined
            } else if (currentX > 0) {
                dragDir = 'prev'

                if (selected.current === 0 && wrapped === false) {
                    console.log('wrap prev')

                    const reset = wrapPrev()

                    setFinish(reset)

                    wrapped = true
                }
            } else if (currentX < 0) {
                dragDir = 'next'
                if (selected.current === slideCount() - 1 && wrapped === false) {
                    console.log('wrap next')

                    wrapped = true
                }
            }

            // console.log('move', { currentX, drag, dragDir })

            setTranslateX(drag)
        }

        const onDragEnd = (e: MouseEvent) => {
            e.preventDefault()

            if (!dragging) {
                return
            }

            dragging = false
            wrapped = false
            xOffset = initialX = currentX

            const currentSlide = xOffset % slideWidth

            // selected.current = currentSlide

            if (finishSlide) {
                finishSlide()
                finishSlide = undefined
            }

            console.log('end', { currentX, currentSlide })
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
            const reset = wrapPrev()

            animateTo(100)

            selected.current = slideCount() - 1

            return () => {
                reset()
                setTranslateX(selected.current * -100)
            }
        }

        animateTo(selected.current * -100)
    })

    const onNext = slideFlow(elm => {
        selected.current++

        if (selected.current === slideCount()) {
            const reset = wrapNext()

            animateTo(selected.current * -100)

            selected.current = 0

            return () => {
                reset()
                setTranslateX(0)
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
