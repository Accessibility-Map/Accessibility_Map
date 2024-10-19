// import React, {useState} from 'react'
// import {Button, Container, Segment} from 'semantic-ui-react'
// //  (replace with data/API)

// const searchResults = [
//   {
//     id: 1,
//     name: 'Teacher Dyer Complex',
//     rampAccessible: true,
//     elavatorAccess: true,
//     handicapParking: false,
//     handicapRestroorms: false,
//   },
//   {id: 2, name: 'Elevator Service Plaza', category: 'Elevators'},
//   {id: 3, name: 'Parking Hub', category: 'Accessible Parking'},
// ]

// const SearchBar = () => {
//   const [searchTerm, setSearchTerm] = useState('')
//   const [rampAccessible, setRampAccessible] = useState(false)
//   const [elavatorAccess, setElavatorAccess] = useState(false)
//   const [handicapParking, setHandicapParking] = useState(false)
//   const [handicapRestroorms, setHandicapRestroorms] = useState(false)

//   // Filter search results based on the search term and selected category
//   const filteredResults = searchResults.filter(item => {
//     const matchesSearchTerm = item.name.toLowerCase().includes(searchTerm.toLowerCase())
//     return (
//       matchesSearchTerm &&
//       (rampAccessible ? item.rampAccessible : true) &&
//       (elavatorAccess ? item.elavatorAccess : true) &&
//       (handicapParking ? item.handicapParking : true) &&
//       (handicapRestroorms ? item.handicapRestroorms : true)
//     )
//   })

//   return (
//     <Container style={styles.container}>
//       <div style={styles.searchFilterContainer}>
//         {/* Search Bar */}
//         <input
//           type='text'
//           placeholder='Search for accessible places...'
//           value={searchTerm}
//           onChange={e => setSearchTerm(e.target.value)}
//           style={styles.searchInput}
//         />
//         {/* Accessibility Filters */}
//         <div className='hide-on-small' style={styles.filterContainer}>
//           <Button style={styles.filterButton} onClick={() => setRampAccessible(!rampAccessible)}>
//             Ramps
//           </Button>
//           <Button style={styles.filterButton} onClick={() => setElavatorAccess(!elavatorAccess)}>
//             Elavators
//           </Button>
//           <Button style={styles.filterButton} onClick={() => setHandicapParking(!handicapParking)}>
//             Parking
//           </Button>
//           <Button
//             style={{
//               ...styles.filterButton,
//               backgroundColor: handicapRestroorms ? 'blue' : '#fff',
//               color: handicapRestroorms && '#fff',
//             }}
//             onClick={() => setHandicapRestroorms(!handicapRestroorms)}>
//             Restrooms
//           </Button>
//         </div>
//       </div>

//       {/* Display Search Results */}
//       {searchTerm && filteredResults.length > 0 && (
//         <Segment style={styles.resultsSegment}>
//           {filteredResults.map(result => (
//             <div key={result.id} style={styles.resultItem}>
//               {result.name}
//             </div>
//           ))}
//         </Segment>
//       )}
//     </Container>
//   )
// }

// const styles = {
//   container: {
//     position: 'absolute',
//     top: '20px',
//     left: '50%',
//     transform: 'translateX(-50%)',
//     width: '90%',
//     zIndex: 1000,
//   },
//   searchFilterContainer: {
//     display: 'flex',
//     alignItems: 'center',
//     width: '1000px',
//   },
//   searchInput: {
//     borderRadius: '30px',
//     boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
//     backgroundColor: '#fff',
//     fontSize: '15px',
//     padding: '15px 25px',
//     border: 'none',
//     outline: 'none',
//     width: '400px',
//   },
//   filterContainer: {
//     //display: 'flex',
//     // gap: '30px',
//     marginLeft: '20px',
//   },
//   filterButton: {
//     backgroundColor: '#fff',
//     borderRadius: '20px',
//     border: 'none',
//     padding: '10px 15px',
//     fontSize: '15px',
//     boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
//     gap: '10px',
//     marginRight: '10px',
//   },

//   resultsSegment: {
//     marginTop: '15px',
//     padding: '1em',
//     backgroundColor: '#fff',
//     boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
//     borderRadius: '30px',
//     maxHeight: '300px',
//     overflowY: 'auto',
//     width: '418px',
//   },
//   resultItem: {
//     padding: '10px 0',
//     borderBottom: '1px solid #eee',
//   },
// }

// export default SearchBar
