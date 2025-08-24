export interface ICardTestimonialData{
    image: string;
    name: string;
    description: string;
}

export const testimonial: Array<ICardTestimonialData> = [
    {
        image: "assets/images/Sara alcantara.jpg",
        name: "Marcia Caiza",
        description: "Mi piel siempre ha sido muy sensible, y los jabones comerciales me dejaban resequedad y ardor. Cuando probé el jabón ORYZA, sentí la diferencia desde el primer lavado. Es suave, cremoso y mi piel quedó hidratada, luminosa y sin irritaciones. ¡Hasta me ayudó con unas manchitas que tenía! Ahora no lo cambio por nada"
    },
    {
        image: "assets/images/Marcos Castro.jpg",
        name: "Natividad Castro",
        description: "Desde el primer día que tomé el potente digestivo me dio tremendos resultados 100% recomendable, además es natural y accesible para todas las familias. Gracias al digestivo de chayim mis molestias gástricas han disminuido bastante"
    },
    {
        image: "assets/images/Emily ruiz.jpg",
        name: "Carlos Choquepuma",
        description: "Llevaba tiempo sintiéndome pesada, con digestiones lentas y sin energía. Probé muchos productos, pero nada me funcionaba... hasta que conocí este detox natural. En solo 7 días, mi cuerpo comenzó a sentirse más liviano, mi digestión mejoró muchísimo y hasta noté cambios en mi piel. Lo mejor es que es 100% natural y me dio confianza desde el 1er día"
    }
];