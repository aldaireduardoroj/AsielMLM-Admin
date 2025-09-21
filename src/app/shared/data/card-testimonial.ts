export interface ICardTestimonialData{
    image: string;
    name: string;
    description: string;
}

export const testimonial: Array<ICardTestimonialData> = [
    {
        image: "assets/images/Sara alcantara.jpg",
        name: "Marcia Caiza",
        description: "He probado el colágeno en polvo de Aziel Network y ayudado bastante a mi calidad de vida: mejoró mi digestión y el cuidado de mi piel. Además, de un gran sabor, es agradable tomarlo en verano con hielo. Excelente producto a precio accesible para todas las familias"
    },
    {
        image: "assets/images/Marcos Castro.jpg",
        name: "Alberto Castro",
        description: "Desde el primer día que tomé el Sacha Jergón de Aziel Network me dio tremendos resultados 100% recomendable, además es natural y accesible para todas las familias. Gracias a Aziel mis molestias gástricas han disminuido bastante"
    },
    {
        image: "assets/images/Emily ruiz.jpg",
        name: "Andrea Choquepuma",
        description: "Llevaba tiempo sintiéndome pesada, con digestiones lentas y sin energía. Probé muchos productos, pero nada me funcionaba... hasta que conocí el Capuccino de Aziel. En solo 7 días, mi cuerpo comenzó a sentirse más liviano, mi digestión mejoró muchísimo y hasta noté cambios en mi piel. Lo mejor es que es 100% natural y me dio confianza desde el 1er día"
    }
];