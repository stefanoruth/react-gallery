export function isParentOf(parent: Element, child: Element) {
    let currentElement = child.parentElement

    while (currentElement) {
        if (currentElement === parent) {
            return true
        }

        currentElement = currentElement.parentElement
    }

    return false
}

export function isSameOrContains(container: Element, child: Element) {
    return container === child || isParentOf(container, child)
}
