/**
 * Implementation of a queue of a fixed size.
 */
export default class PathQueue {

    constructor(size) {
        this.queue = [];
        this.size = size;
    }

    /**
     * Put a new item in the queue. If this causes the queue to exceed its size limit, the oldest
     * item will be discarded.
     * @param item
     */
    put(item) {
        this.queue.push(item);
        if (this.size < this.queue.length) {
            this.queue.shift();
        }
    }

    /**
     * Get an item from the queue, specified by index. 0 gets the oldest item in the queue, 1 the second oldest etc.
     * -1 gets the newest item, -2 the second newest etc.
     *
     * @param index
     * @returns {*}
     */
    get(index = 0) {
        var length = this.queue.length;
        if (0 <= index && index <= length) {
            return this.queue[index];
        } else if (index < 0 && Math.abs(index) <= length) {
            return this.queue[length + index];
        } else {
            return undefined;
        }
    }

    contains(item) {
        var matches = this.queue.filter((point) => {
            return point[0] === item[0] && point[1] === item[1];
        });

        return 0 < matches.length;
    }
}