/**
 * @namespace Pipe
 * @file Create pipes which allow communication between iframes
 * @author Daniel Reynolds
 */

Pipe = {
    //list of all pipes and their listeners currently active
    pipes: [],

    //public functions ---------------
    createPipe: function (id, listener) {
        if (this.indexOfPipe(id) === -1) {
            this.pipes.push({
                id: id,
                listener: listener
            });
            return id;
        }
        else{
            return null;
        }
    },

    removePipe: function (id) {
        const pipeIndex = this.indexOfPipe(id);
        if (pipeIndex !== -1) {
            this.pipes.splice(pipeIndex, 1); //remove the pipe
            return true;
        }
        return false;
    },

    pipe: function (id, data) {
        const pipeIndex = this.indexOfPipe(id);
        if (pipeIndex !== -1) {
            this.pipes[pipeIndex].listener(data);
            return true;
        }
        return false;
    },

    //private functions --------------
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