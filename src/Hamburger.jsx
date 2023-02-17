import React from 'react'

const Hamburger = () => {
  return (
  <nav>
    <input type="checkbox" className="hum-check"/>
    <span className="hum-stick stick1"></span>
    <span className="hum-stick stick2"></span>
    <span className="hum-stick stick3"></span>
    <div className='hum-hidden'>
      hi!
    </div>
  </nav>
  )
}

export default Hamburger