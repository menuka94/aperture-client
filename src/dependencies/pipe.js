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
        pipes.push({
            id: id,
            listener: listener
        });
        return id;
    },

    removePipe: function (id) {
        const pipeIndex = this.indexOfPipe(id);
        if(pipeIndex !== -1){
            pipes.splice(pipeIndex,1); //remove the pipe
            return true;
        }
        return false;
    },

    pipe: function (id, data) {
        const pipeIndex = this.indexOfPipe(id);
        if (pipeIndex !== -1) {
            pipes[pipeIndex].listener(data);
            return true;
        }
        return false;
    },

    //private functions --------------
    indexOfPipe(id) {
        for (let i = 0; i < pipes.length; i++) {
            if (pipes[i].id === id)
                return i;
        }
        return -1;
    }
}

try {
    module.exports = {
        Pipe: Pipe
    };
} catch(e) { }