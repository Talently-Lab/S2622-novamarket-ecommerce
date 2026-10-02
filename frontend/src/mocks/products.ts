export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Auriculares Bluetooth NovaSound X1',
    description:
      'Auriculares inalambricos over-ear con cancelacion de ruido activa y 30h de bateria',
    price: 45999.9,
    stock: 24,
    category: 'accesorios',
    imageUrl:
      'https://placehold.co/600x400/png?text=Auriculares%20Bluetooth%20NovaSound%20X1',
  },
  {
    id: 2,
    name: 'Mouse Gamer NovaTech RGB 7200DPI',
    description:
      'Mouse optico para gaming con sensor de alta precision y luces RGB personalizables',
    price: 18500.0,
    stock: 40,
    category: 'perifericos',
    imageUrl:
      'https://placehold.co/600x400/png?text=Mouse%20Gamer%20NovaTech%20RGB%207200DPI',
  },
  {
    id: 3,
    name: 'Teclado Mecanico NovaKey TKL',
    description:
      'Teclado mecanico tamano reducido con switches azules e iluminacion LED',
    price: 52300.5,
    stock: 18,
    category: 'perifericos',
    imageUrl:
      'https://placehold.co/600x400/png?text=Teclado%20Mec%C3%A1nico%20NovaKey%20TKL',
  },
  {
    id: 4,
    name: 'Cargador USB-C NovaCharge 65W',
    description:
      'Cargador rapido GaN de 65W compatible con notebooks y celulares',
    price: 15999.0,
    stock: 60,
    category: 'accesorios',
    imageUrl:
      'https://placehold.co/600x400/png?text=Cargador%20USB-C%20NovaCharge%2065W',
  },
  {
    id: 5,
    name: 'Power Bank NovaEnergy 20000mAh',
    description:
      'Bateria portatil de carga rapida con doble puerto USB-A y USB-C',
    price: 22750.0,
    stock: 35,
    category: 'accesorios',
    imageUrl:
      'https://placehold.co/600x400/png?text=Power%20Bank%20NovaEnergy%2020000mAh',
  },
  {
    id: 6,
    name: 'Smartwatch NovaFit Pulse',
    description:
      'Reloj inteligente con monitor de frecuencia cardiaca y notificaciones',
    price: 68900.0,
    stock: 15,
    category: 'gadgets',
    imageUrl:
      'https://placehold.co/600x400/png?text=Smartwatch%20NovaFit%20Pulse',
  },
  {
    id: 7,
    name: 'Parlante Bluetooth NovaBoom Mini',
    description: 'Parlante portatil resistente al agua con 12h de autonomia',
    price: 27400.0,
    stock: 28,
    category: 'gadgets',
    imageUrl:
      'https://placehold.co/600x400/png?text=Parlante%20Bluetooth%20NovaBoom%20Mini',
  },
  {
    id: 8,
    name: 'Webcam HD NovaView 1080p',
    description: 'Webcam full HD con microfono integrado para videollamadas',
    price: 19850.0,
    stock: 22,
    category: 'perifericos',
    imageUrl:
      'https://placehold.co/600x400/png?text=Webcam%20HD%20NovaView%201080p',
  },
  {
    id: 9,
    name: 'Hub USB NovaConnect 7 en 1',
    description: 'Hub multipuerto con USB 3.0, HDMI y lector de tarjetas SD',
    price: 24300.0,
    stock: 30,
    category: 'accesorios',
    imageUrl:
      'https://placehold.co/600x400/png?text=Hub%20USB%20NovaConnect%207%20en%201',
  },
  {
    id: 10,
    name: 'Mousepad Gamer NovaGrip XL',
    description: 'Alfombrilla extendida antideslizante con base de goma',
    price: 8900.0,
    stock: 50,
    category: 'accesorios',
    imageUrl:
      'https://placehold.co/600x400/png?text=Mousepad%20Gamer%20NovaGrip%20XL',
  },
  {
    id: 11,
    name: 'Auriculares Gamer NovaSound G7',
    description: 'Headset con microfono desmontable y sonido envolvente 7.1',
    price: 39900.0,
    stock: 20,
    category: 'perifericos',
    imageUrl:
      'https://placehold.co/600x400/png?text=Auriculares%20Gamer%20NovaSound%20G7',
  },
  {
    id: 12,
    name: 'Camara de Seguridad NovaEye WiFi',
    description: 'Camara IP con vision nocturna y deteccion de movimiento',
    price: 34750.0,
    stock: 12,
    category: 'gadgets',
    imageUrl:
      'https://placehold.co/600x400/png?text=C%C3%A1mara%20de%20Seguridad%20NovaEye%20WiFi',
  },
  {
    id: 13,
    name: 'Cable USB-C a HDMI NovaLink 2m',
    description:
      'Cable adaptador para conectar dispositivos a monitores externos',
    price: 9450.0,
    stock: 45,
    category: 'accesorios',
    imageUrl:
      'https://placehold.co/600x400/png?text=Cable%20USB-C%20a%20HDMI%20NovaLink%202m',
  },
  {
    id: 14,
    name: 'Soporte para Notebook NovaStand Alu',
    description: 'Soporte ergonomico de aluminio ajustable en altura',
    price: 16200.0,
    stock: 26,
    category: 'accesorios',
    imageUrl:
      'https://placehold.co/600x400/png?text=Soporte%20para%20Notebook%20NovaStand%20Alu',
  },
  {
    id: 15,
    name: 'Microfono de Escritorio NovaVoice USB',
    description: 'Microfono condensador USB para streaming y videollamadas',
    price: 31500.0,
    stock: 17,
    category: 'perifericos',
    imageUrl:
      'https://placehold.co/600x400/png?text=Micr%C3%B3fono%20de%20Escritorio%20NovaVoice%20USB',
  },
  {
    id: 16,
    name: 'Lampara LED NovaLight Desk',
    description: 'Lampara de escritorio con brillo regulable y carga USB',
    price: 12800.0,
    stock: 33,
    category: 'gadgets',
    imageUrl:
      'https://placehold.co/600x400/png?text=L%C3%A1mpara%20LED%20NovaLight%20Desk',
  },
  {
    id: 17,
    name: 'Adaptador WiFi USB NovaSignal AC600',
    description: 'Adaptador de red inalambrico de alta velocidad',
    price: 7650.0,
    stock: 55,
    category: 'accesorios',
    imageUrl:
      'https://placehold.co/600x400/png?text=Adaptador%20WiFi%20USB%20NovaSignal%20AC600',
  },
  {
    id: 18,
    name: 'Control Gamer NovaPlay Wireless',
    description: 'Joystick inalambrico compatible con PC y consolas',
    price: 29900.0,
    stock: 19,
    category: 'perifericos',
    imageUrl:
      'https://placehold.co/600x400/png?text=Control%20Gamer%20NovaPlay%20Wireless',
  },
  {
    id: 19,
    name: 'Disco Externo SSD NovaSpeed 500GB',
    description: 'Unidad de almacenamiento externo portatil de alta velocidad',
    price: 54200.0,
    stock: 14,
    category: 'gadgets',
    imageUrl:
      'https://placehold.co/600x400/png?text=Disco%20Externo%20SSD%20NovaSpeed%20500GB',
  },
  {
    id: 20,
    name: 'Ventilador USB NovaCool Desk',
    description: 'Mini ventilador de escritorio con conexion USB',
    price: 6500.0,
    stock: 48,
    category: 'gadgets',
    imageUrl:
      'https://placehold.co/600x400/png?text=Ventilador%20USB%20NovaCool%20Desk',
  },
];
