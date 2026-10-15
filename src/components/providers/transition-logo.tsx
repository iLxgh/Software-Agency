import { LogoWordmark } from "@/components/ui/logo-wordmark";

/**
 * Lo que aparece con la cortina puesta: el logotipo de la marca.
 *
 * Es el SVG del nombre, no texto con una fuente del proyecto. La ventaja es
 * doble: conserva la tipografía exacta del logo (que no es la Neue) y trae cada
 * letra como path independiente, así que se anima letra a letra igual que haría
 * SplitText — con la barra verde de la K y el ® como piezas propias.
 *
 * Se descartó animar el símbolo del cubo: su SVG viene con los trazos
 * convertidos a contorno, y las técnicas que eso admite —rellenarlo o montarlo
 * por piezas— lo convierten en una figura maciza o en fragmentos sueltos.
 *
 * Solo pinta: de animarlo se encarga el proveedor, que es quien tiene el
 * timeline.
 */
export function TransitionLogo() {
  return (
    <LogoWordmark className="h-8 w-auto text-background sm:h-11" />
  );
}
