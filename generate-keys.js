import jwt from "jsonwebtoken"

const SECRET = "9pTI4u+n1Nypj9DyXUn6Ec/GPr/m69nithwuM4MED6Y="

// ANON KEY
const anon = jwt.sign(
  {
    role: "anon",
    iss: "supabase",
  },
  SECRET,
  { expiresIn: "10y" }
)

// SERVICE ROLE KEY
const service = jwt.sign(
  {
    role: "service_role",
    iss: "supabase",
  },
  SECRET,
  { expiresIn: "10y" }
)

console.log("ANON_KEY=" + anon)
console.log("SERVICE_ROLE_KEY=" + service)