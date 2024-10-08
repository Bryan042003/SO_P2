export class FIFO {
    private numFrames: number;     // Cantidad de marcos de página en la memoria real
    private frames: number[];      // Cola FIFO para las páginas en la memoria
    private pageFaults: number;    // Contador de fallos de página

    constructor(numFrames: number) {
        this.numFrames = numFrames;
        this.frames = [];
        this.pageFaults = 0;
    }

    // Método para acceder a una página en la memoria
    accessPage(pageId: number): void {
        if (this.frames.includes(pageId)) {
            // Si la página ya está en la memoria
            console.log(`Page ${pageId} is already in memory.`);
        } else {
            // Si hay un fallo de página
            this.pageFaults++;
            if (this.frames.length < this.numFrames) {
                // Si hay espacio en la memoria, agregamos la nueva página
                this.frames.push(pageId);
                console.log(`Page ${pageId} loaded into memory.`);
            } else {
                // Si no hay espacio, removemos la primera página (FIFO) y cargamos la nueva
                const evictedPage = this.frames.shift();
                this.frames.push(pageId);
                console.log(`Page ${pageId} loaded into memory. Page ${evictedPage} evicted.`);
            }
        }
    }

    // Método para obtener el número total de fallos de página
    getPageFaults(): number {
        return this.pageFaults;
    }

    // Método para obtener el estado actual de los marcos de memoria
    getFrames(): number[] {
        return this.frames;
    }
}

// Ejemplo de uso
const fifo = new FIFO(3);

// Accedemos a las páginas en orden
fifo.accessPage(1);  // Carga la página 1
fifo.accessPage(2);  // Carga la página 2
fifo.accessPage(3);  // Carga la página 3
fifo.accessPage(1);  // Página 1 ya está en memoria
fifo.accessPage(4);  // Evicta la página 1, carga la página 4
fifo.accessPage(5);  // Evicta la página 2, carga la página 5

// Mostramos el número total de fallos de página
console.log("Total page faults:", fifo.getPageFaults());

// Mostramos el estado actual de los marcos de memoria
console.log("Current frames:", fifo.getFrames());
