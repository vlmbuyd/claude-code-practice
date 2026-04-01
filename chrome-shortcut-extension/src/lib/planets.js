const modules = import.meta.glob('../assets/planets/*.png', { eager: true })
export const PLANETS = Object.values(modules).map((m) => m.default)
export const randomPlanet = () => PLANETS[Math.floor(Math.random() * PLANETS.length)]
