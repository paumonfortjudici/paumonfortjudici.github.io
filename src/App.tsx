import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Trayectoria from './components/Trayectoria'
import Skills from './components/Skills'
import MicroSkills from './components/MicroSkills'
import Proyectos from './components/Proyectos'
import CustomCursor from './components/CustomCursor'

export default function App() {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <Hero />
      <Trayectoria />
      <Skills />
      <MicroSkills />
      <Proyectos />
    </>
  )
}
