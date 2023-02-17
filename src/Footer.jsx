import React from 'react'

const Footer = () => {
  let nYear = new Date().getFullYear();
  return (
    <footer>&copy; 2022 - {nYear}</footer>
  )
}

export default Footer