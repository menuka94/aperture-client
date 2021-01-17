/**
 * @namespace Pipe
 * @file Create pipes which allow communication between iframes
 * @author Daniel Reynolds
 */

Pipe = {
    //list of all pipes and their listeners currently active
    pipes: [],

    //public functions ---------------
    /**
      * Creates a pipe with a given id and endpoint
      * @memberof Pipe
      * @method createPipe
      * @param {string} id name/id of pipe being created, this is completly user defined
      * @param {Function} listener function which will be called as the endpoint of this pipe
      * @returns {boolean} true if successfully created, false if not. 
      */
    createPipe: function (id, listener) {
        if (this.indexOfPipe(id) === -1) {
            this.pipes.push({
                id: id,
                listener: listener
            });
            return true;
        }
        return false;
    },

    /**
      * Removes a pipe with a given ID
      * @memberof Pipe
      * @method removePipe
      * @param {string} id name/id of pipe being removed
      * @returns {boolean} true if successfully removed, false if not. 
      */
    removePipe: function (id) {
        const pipeIndex = this.indexOfPipe(id);
        if (pipeIndex !== -1) {
            this.pipes.splice(pipeIndex, 1); //remove the pipe
            return true;
        }
        return false;
    },

    /**
      * Sends data over a given pipe
      * @memberof Pipe
      * @method pipe
      * @param {string} id name/id of pipe to send data over
      * @param {?} data whatever data should be sent to the endpoint listener of the pipe
      * @returns {boolean} true if successfully sent, false if not
      */
    pipe: function (id, data) {
        const pipeIndex = this.indexOfPipe(id);
        if (pipeIndex !== -1) {
            this.pipes[pipeIndex].listener(data);
            return true;
        }
        return false;
    },

    //private functions --------------
    /**
      * Finds the index of a pipe
      * @memberof Pipe
      * @method pipe
      * @param {string} id name/id of pipe to send data over
      * @returns {Number} index of pipe if found (>= 0). -1 if not found.
      */
    indexOfPipe(id) {
        for (let i = 0; i < this.pipes.length; i++) {
            if (this.pipes[i].id === id)
                return i;
        }
        return -1;
    }
}

try {
    module.exports = {
        Pipe: Pipe
    };
} catch (e) { }