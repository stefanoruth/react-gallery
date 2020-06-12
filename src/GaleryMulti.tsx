import * as React from 'react'
import { isSameOrContains } from './helpers'

const useDragging = (ref: React.RefObject<HTMLElement>, onDrag: (amount: number) => void, getOffset: () => number) => {
    React.useEffect(() => {
        if (!ref.current) {
            return
        }

        let currentX: number
        let initialX: number
        let dragging = false

        const onDragStartEvent = (e: MouseEvent) => {
            if (!ref.current || !e.target) {
                return
            }

            if (!isSameOrContains(ref.current, e.target as any)) {
                return
            }

            dragging = true

            initialX = e.clientX - getOffset()
        }

        const onDragEndEvent = (e: MouseEvent) => {
            if (!dragging) {
                return
            }

            initialX = currentX
            dragging = false
        }

        const onDragEvent = (e: MouseEvent) => {
            if (!dragging) {
                return
            }

            currentX = e.clientX - initialX

            onDrag(currentX)
        }

        document.addEventListener('mousedown', onDragStartEvent, false)
        document.addEventListener('mouseup', onDragEndEvent, false)
        document.addEventListener('mousemove', onDragEvent, false)

        return () => {
            if (!ref.current) {
                return
            }

            document.removeEventListener('mousedown', onDragStartEvent, false)
            document.removeEventListener('mouseup', onDragEndEvent, false)
            document.removeEventListener('mousemove', onDragEvent, false)
        }
    }, [!!ref.current])
}

export const GalleryMulti: React.FunctionComponent = props => {
    const time = 3000
    const animationTime = 500
    const infinite = true
    const galleryRef = React.useRef<HTMLDivElement>(null)
    const galleryTrackRef = React.useRef<HTMLDivElement>(null)
    const slideStep = React.useRef(0)
    const slideChange = React.useRef<Promise<void>>()
    const [autoSlide, setAutoSlide] = React.useState(true)

    // useEventListener(galleryRef, 'mouseenter', () => {
    //     setAutoSlide(false)
    // })

    // useEventListener(galleryRef, 'mouseleave', () => {
    //     setAutoSlide(true)
    // })

    const setTransitionDelay = (value: number) => {
        if (galleryTrackRef.current) {
            galleryTrackRef.current.style.webkitTransitionDuration = `${value}ms`
            galleryTrackRef.current.style.transitionDuration = `${value}ms`
        }
    }

    const setTranslateX = (width: number) => {
        if (galleryTrackRef.current) {
            galleryTrackRef.current.style.webkitTransform = `translateX(-${width}px)`
            galleryTrackRef.current.style.transform = `translateX(-${width}px)`
        }
    }

    const getTranslateX = () => {
        if (galleryTrackRef.current) {
            return parseInt(galleryTrackRef.current.style.transform.replace('translateX(', '').replace('px)', ''), 10)
        }
        return NaN
    }

    const elementIsClone = (elm: Element) => elm.getAttribute('data-clone') !== null

    const getOriginalIndex = (type: 'first' | 'last') => {
        if (!galleryTrackRef.current) {
            return -1
        }

        const children = Array.from(galleryTrackRef.current.children)
        const cloneCount = children.filter(elm => elm.classList.contains('slide-clone')).length

        if (type === 'last') {
            return children.length - 1 - cloneCount / 2
        }

        return cloneCount / 2
    }

    const hasClones = () => {
        if (!galleryTrackRef.current) {
            return false
        }

        return (
            Array.from(galleryTrackRef.current.children).filter(item => item.classList.contains('slide-clone')).length >
            0
        )
    }

    const calcSlideStep = () => {
        if (!galleryTrackRef.current) {
            return NaN
        }

        const children = Array.from(galleryTrackRef.current.children)

        const width = children[0].clientWidth

        const step = Math.floor(getTranslateX() / width) * -1

        return step
    }

    const slidesCount = () => (galleryTrackRef.current && galleryTrackRef.current.children.length) || 0

    const slideTo = (value: number, animate: boolean = true) =>
        (slideChange.current = new Promise(resolve => {
            if (!galleryTrackRef.current) {
                return
            }

            console.log('slideTo', value)

            const children = Array.from(galleryTrackRef.current.children)

            children.forEach(elm => elm.classList.remove('active'))

            const showedChildren = children.slice(0, value + 1)

            const active = showedChildren.pop()

            const width = showedChildren.map(item => item.clientWidth).reduce((a, b) => a + b, 0)

            let isClone = false

            if (active) {
                active.classList.add('active')

                if (active.classList.contains('slide-clone')) {
                    isClone = true
                }
            }

            slideStep.current = value

            if (animate) {
                setTransitionDelay(animationTime)
            }

            setTranslateX(width)

            if (animate && !isClone) {
                setTimeout(() => {
                    setTransitionDelay(0)
                }, animationTime)
            }

            if (isClone) {
                // console.log(active)
                const first = getOriginalIndex('first')
                const last = getOriginalIndex('last')

                setTimeout(() => {
                    setTransitionDelay(0)
                    if (value <= first) {
                        slideTo(last, false)
                    } else {
                        slideTo(first, false)
                    }
                }, animationTime)
            }

            resolve()
            slideChange.current = undefined
        }))

    const copySlides = (from: number, to: number) => {
        if (!galleryTrackRef.current) {
            return []
        }

        const slides = Array.from(galleryTrackRef.current.children)

        const dir = from === 0 ? 'start' : 'end'

        const copies = slides.slice(from, to).map((child, i) => {
            const clone = child.cloneNode(true)
            ;(clone as HTMLElement).classList.add('slide-clone')

            const counter = dir === 'start' ? i + 1 : to - from - i
            ;(clone as HTMLElement).setAttribute('data-clone', counter.toString())

            return clone
        })

        return copies
    }

    React.useEffect(() => {
        if (!galleryRef.current || !galleryTrackRef.current) {
            return
        }

        if (hasClones()) {
            // console.log('Some render')
            return
        }

        // console.log(galleryRef.current, galleryTrackRef.current)

        const viewWidth = galleryRef.current.clientWidth
        const itemWidth = galleryTrackRef.current.children[0].clientWidth
        const clonesNeeded = Math.ceil(viewWidth / itemWidth)

        // console.log('viewWidth', viewWidth)
        // console.log('itemWidth', itemWidth)
        // console.log('replicas')

        const total = slidesCount()

        const start = copySlides(0, clonesNeeded)
        const end = copySlides(total - clonesNeeded, total)

        // console.log('start', start)
        // console.log('end', end)

        galleryTrackRef.current.append(...start)
        galleryTrackRef.current.prepend(...end)

        slideTo(end.length, false)

        // copySlide(slidesCount() - 1, 'prepend')
        // copySlide(0, 'append')
        // slideTo(2)
    }, [!!galleryRef.current && !!galleryTrackRef.current])

    const next = async () => {
        const i = slideStep.current + 1

        if (slideChange.current) {
            await slideChange.current
        }

        if (i >= slidesCount()) {
            return slideTo(0)
        }

        return slideTo(i)
    }

    const prev = async () => {
        const step = calcSlideStep()

        console.log('hop', step)

        const i = slideStep.current - 1

        if (slideChange.current) {
            await slideChange.current
        }

        if (i < 0) {
            return slideTo(slidesCount() - 1)
        }

        return slideTo(i)
    }

    const startAutoPlay = () => {
        const timer = setInterval(() => {
            // next()
        }, time)

        return () => clearInterval(timer)
    }

    // useOnKey('ArrowLeft', () => {
    //     if (
    //         galleryRef.current &&
    //         document.activeElement &&
    //         isSameOrContains(galleryRef.current, document.activeElement)
    //     ) {
    //         prev()
    //     }
    // })

    // useOnKey('ArrowRight', () => {
    //     if (
    //         galleryRef.current &&
    //         document.activeElement &&
    //         isSameOrContains(galleryRef.current, document.activeElement)
    //     ) {
    //         next()
    //     }
    // })

    React.useEffect(() => {
        if (!autoSlide) {
            return
        }

        return startAutoPlay()
    }, [autoSlide])

    useDragging(
        galleryTrackRef,
        value => {
            if (!galleryTrackRef.current) {
                return
            }

            const children = Array.from(galleryTrackRef.current.children)

            const step = calcSlideStep() - 1

            const activeIndex = children.findIndex(elm => elm.classList.contains('active'))

            if (activeIndex !== step) {
                children.forEach(elm => elm.classList.remove('active'))

                children[step].classList.add('active')
            }

            slideStep.current = step

            console.log('step', step)

            setTranslateX(value * -1)
        },
        () => getTranslateX()
    )

    // React.useEffect(() => {
    // 	if (!galleryTrackRef.current) {
    // 		return
    // 	}

    // 	let currentX: number
    // 	let initialX: number
    // 	let xOffset: number = 0
    // 	// let dragging = false

    // 	const onDragStart = (e: MouseEvent) => {
    // 		isDragging.current = true

    // 		// console.log('onDragStart', isDragging.current)
    // 		initialX = e.clientX - xOffset
    // 	}

    // 	const onDragEnd = (e: MouseEvent) => {
    // 		initialX = currentX
    // 		isDragging.current = false
    // 		// console.log('onDragEnd', isDragging.current)
    // 	}

    // 	const onDrag = (e: MouseEvent) => {
    // 		if (!isDragging.current) {
    // 			return
    // 		}

    // 		currentX = e.clientX - initialX

    // 		xOffset = currentX

    // 		setTranslateX(currentX * -1)
    // 		// console.log('onDrag', currentX)
    // 	}

    // 	galleryTrackRef.current!.addEventListener('mousedown', onDragStart, false)
    // 	galleryTrackRef.current!.addEventListener('mouseup', onDragEnd, false)
    // 	galleryTrackRef.current!.addEventListener('mousemove', onDrag, false)

    // 	return () => {
    // 		if (!galleryRef.current) {
    // 			return
    // 		}

    // 		galleryTrackRef.current!.removeEventListener('mousedown', onDragStart, false)
    // 		galleryTrackRef.current!.removeEventListener('mouseup', onDragEnd, false)
    // 		galleryTrackRef.current!.removeEventListener('mousemove', onDrag, false)
    // 	}
    // }, [])

    return (
        <div id="gallery" className="relative overflow-hidden" ref={galleryRef}>
            <div className="absolute right-0 top-50 z-20">
                <button className="w-12 h-12 bg-gray-400" onClick={next}>
                    next
                </button>
            </div>
            <div className="absolute left-0 top-50 z-20">
                <button className="w-12 h-12 bg-gray-400" onClick={prev}>
                    prev
                </button>
            </div>
            <div
                className="flex cursor-pointer transition ease-linear transition-transform gallery-track"
                style={{
                    WebkitTransform: 'translateX(0px)',
                    transform: 'translateX(0px)',
                }}
                ref={galleryTrackRef}>
                {React.Children.map(props.children, child => (
                    <div className="flex-1 select-none" tabIndex={-1}>
                        {child}
                    </div>
                ))}
            </div>
        </div>
    )
}
