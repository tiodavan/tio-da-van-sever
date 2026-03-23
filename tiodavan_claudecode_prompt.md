# Tio da Van — Claude Code Prompt: NestJS Server

## Project context

You are building the backend for **Tio da Van**, a school transportation app that connects van drivers with parents, guardians, and students. The backend handles authentication, business entity CRUD, trip events, and Firebase integrations.

---

## Tech stack

- **Framework:** NestJS with TypeScript (strict mode)
- **Primary database:** PostgreSQL via **Prisma ORM**
- **Realtime database:** Firebase Realtime Database (Admin SDK) — used exclusively to delete the location node when a trip ends. GPS writes are performed directly by the mobile app via Firebase SDK, never by the backend.
- **Authentication:** Firebase Auth — the backend validates the JWT issued by Firebase using the Admin SDK
- **Push notifications:** Firebase Cloud Messaging (FCM)
- **WhatsApp:** HTTP integration via Z-API or Twilio (implement as an abstract service for now)
- **Route optimization:** Google Maps Directions API
- **Document storage:** Firebase Storage (only the URL reference is stored in the database)

---

## Module structure

Create the project with the following NestJS modules, each in its own folder under `src/`:

```
src/
  auth/           # Firebase JWT validation, guards, decorators
  users/          # User and user_roles CRUD
  companies/      # Company CRUD (individual and legal entity)
  drivers/        # Driver CRUD, document upload, status management
  students/       # Student CRUD, requires_guardian logic
  guardianships/  # Guardian ↔ student relationship management
  vehicles/       # Driver vehicle CRUD
  routes/         # Driver recurring routes
  trips/          # Trips: create, start, end
  presences/      # Presence confirmation/denial per trip
  trip-events/    # Important event persistence (pickup, dropoff, etc.)
  notifications/  # Push (FCM) and WhatsApp notification service
  marketplace/    # Driver search and filtering
  firebase/       # Global module: Firebase Admin SDK (Auth + RT DB + FCM + Storage)
  prisma/         # Global module: PrismaService singleton
```

---

## Prisma setup

### Installation
```bash
npm install prisma @prisma/client
npx prisma init
```

### PrismaService

Create `src/prisma/prisma.service.ts` extending `PrismaClient` and implementing `OnModuleInit` and `OnModuleDestroy`. Register as a global module (`@Global()`) so all other modules can inject it without importing `PrismaModule` individually.

```ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```

### Prisma schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  driver
  guardian
  student
}

enum CompanyType {
  individual
  legal_entity
}

enum DriverStatus {
  pending
  active
  suspended
}

enum TripStatus {
  scheduled
  active
  completed
}

enum TripEventType {
  trip_started
  pickup
  missed_pickup
  arrived_school
  dropoff
  trip_ended
}

model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  phone         String?
  dateOfBirth   DateTime @map("date_of_birth")
  createdAt     DateTime @default(now()) @map("created_at")

  roles         UserRole[]
  company       Company?
  driver        Driver?
  student       Student?
  guardianOf    Guardianship[] @relation("Guardian")
  studentOf     Guardianship[] @relation("Student")
  reviews       Review[]       @relation("Reviewer")

  @@map("users")
}

model UserRole {
  userId  String @map("user_id")
  role    Role

  user    User   @relation(fields: [userId], references: [id])

  @@id([userId, role])
  @@map("user_roles")
}

model Company {
  id           String      @id @default(uuid())
  userId       String      @unique @map("user_id")
  taxId        String      @map("tax_id") // CPF when individual, CNPJ when legal entity
  legalName    String      @map("legal_name")
  type         CompanyType
  plan         String?

  user         User        @relation(fields: [userId], references: [id])
  driver       Driver?

  @@map("companies")
}

model Driver {
  userId        String       @id @map("user_id")
  companyId     String       @map("company_id")
  licenseUrl    String?      @map("license_url")
  vehicleRegUrl String?      @map("vehicle_reg_url")
  bgCheckUrl    String?      @map("bg_check_url")
  status        DriverStatus @default(pending)
  createdAt     DateTime     @default(now()) @map("created_at")

  user          User         @relation(fields: [userId], references: [id])
  company       Company      @relation(fields: [companyId], references: [id])
  vehicles      Vehicle[]
  routes        Route[]
  reviews       Review[]

  @@map("drivers")
}

model Vehicle {
  id        String @id @default(uuid())
  driverId  String @map("driver_id")
  make      String
  model     String
  color     String
  year      Int
  plate     String
  capacity  Int

  driver    Driver @relation(fields: [driverId], references: [userId])

  @@map("vehicles")
}

model Student {
  userId        String @id @map("user_id")
  school        String
  pickupAddress String @map("pickup_address")

  user          User        @relation(fields: [userId], references: [id])
  presences     Presence[]
  tripEvents    TripEvent[]

  @@map("students")
}

model Guardianship {
  guardianUserId String   @map("guardian_user_id")
  studentUserId  String   @map("student_user_id")
  approved       Boolean  @default(false)
  active         Boolean  @default(true)
  createdAt      DateTime @default(now()) @map("created_at")

  guardian       User     @relation("Guardian", fields: [guardianUserId], references: [id])
  student        User     @relation("Student", fields: [studentUserId], references: [id])

  @@id([guardianUserId, studentUserId])
  @@map("guardianships")
}

model Route {
  id            String   @id @default(uuid())
  driverId      String   @map("driver_id")
  origin        String
  destination   String
  departureTime String   @map("departure_time") // e.g. "07:30"
  weekdays      String[]
  slots         Int
  active        Boolean  @default(true)

  driver        Driver   @relation(fields: [driverId], references: [userId])
  trips         Trip[]

  @@map("routes")
}

model Trip {
  id             String     @id @default(uuid())
  routeId        String     @map("route_id")
  date           DateTime
  status         TripStatus @default(scheduled)
  trackingActive Boolean    @default(false) @map("tracking_active")
  createdAt      DateTime   @default(now()) @map("created_at")

  route          Route       @relation(fields: [routeId], references: [id])
  presences      Presence[]
  events         TripEvent[]

  @@map("trips")
}

model Presence {
  id          String    @id @default(uuid())
  tripId      String    @map("trip_id")
  studentId   String    @map("student_id")
  confirmed   Boolean?
  confirmedAt DateTime? @map("confirmed_at")
  deadlineAt  DateTime  @map("deadline_at")

  trip        Trip      @relation(fields: [tripId], references: [id])
  student     Student   @relation(fields: [studentId], references: [userId])

  @@map("presences")
}

model TripEvent {
  id         String        @id @default(uuid())
  tripId     String        @map("trip_id")
  studentId  String?       @map("student_id")
  type       TripEventType
  lat        Decimal?      @db.Decimal(9, 6)
  lng        Decimal?      @db.Decimal(9, 6)
  occurredAt DateTime      @default(now()) @map("occurred_at")

  trip       Trip          @relation(fields: [tripId], references: [id])
  student    Student?      @relation(fields: [studentId], references: [userId])

  @@map("trip_events")
}

model Review {
  id             String   @id @default(uuid())
  driverId       String   @map("driver_id")
  reviewerUserId String   @map("reviewer_user_id")
  rating         Int
  punctuality    Int
  safety         Int
  communication  Int
  comment        String?
  createdAt      DateTime @default(now()) @map("created_at")

  driver         Driver   @relation(fields: [driverId], references: [userId])
  reviewer       User     @relation("Reviewer", fields: [reviewerUserId], references: [id])

  @@map("reviews")
}
```

---

## Critical business rules

1. **Company always created on driver registration:** when registering a driver, always create a `Company` record. When the type is `individual`, the `taxId` field receives the user's CPF.

2. **requires_guardian is never stored:** never persist this as a database field. Calculate it in the service layer by comparing `user.dateOfBirth` against `now() - 18 years`. Expose it only as a computed property in the response DTO.

3. **Firebase RT DB — backend only deletes:** the backend NEVER writes GPS position to Firebase. It only deletes the node `vans/{driverId}` via Admin SDK when a trip ends (status → `completed`). GPS writes are the mobile app's responsibility.

4. **trip_events is append-only:** never update or delete records in this table. INSERT only.

5. **Authentication via Firebase Auth:** every authenticated request must pass through a guard that validates the Bearer JWT using `firebaseAdmin.auth().verifyIdToken()`. The `uid` returned by Firebase is used as the `User.id` in the database — they must match.

6. **Notifications triggered by events:** when persisting a `TripEvent` of type `pickup` or `arrived_school`, the `TripEventsService` must call `NotificationsService` to send a push notification via FCM to the student's parent/guardian.

---

## Minimum expected endpoints (MVP)

### Auth
```
POST /auth/register    # creates user + role + company/driver/student based on type
POST /auth/verify      # validates Firebase token and returns user profile
```

### Drivers
```
GET   /drivers/me            # authenticated driver profile
PATCH /drivers/me            # update driver data
POST  /drivers/me/documents  # update document URLs from Firebase Storage
PATCH /drivers/me/status     # admin approves or suspends a driver
```

### Routes
```
GET    /routes       # list routes for the authenticated driver
POST   /routes       # create a new route
PATCH  /routes/:id   # update a route
DELETE /routes/:id   # remove a route
```

### Trips
```
GET  /trips           # list trips for the authenticated driver (filter by date)
POST /trips           # create a trip from a route
POST /trips/:id/start # start trip → status: active, trackingActive: true
POST /trips/:id/end   # end trip → status: completed, delete Firebase RT DB node
GET  /trips/:id/route # return optimized waypoint route via Google Maps Directions API
```

### Trip Events
```
POST /trips/:id/events  # persist event (pickup, dropoff, etc.) + trigger notification
GET  /trips/:id/events  # list all events for a trip
```

### Presences
```
GET   /trips/:id/presences  # list presences for a trip
PATCH /presences/:id        # parent confirms or denies presence
```

### Marketplace
```
GET /marketplace/drivers  # search drivers — filters: school, neighborhood, time, min_rating
```

### Students
```
GET  /students/me                # authenticated student profile
POST /students/me/guardian-link  # request guardian link
```

---

## Environment variables

Create a `.env.example` with the following:

```env
# App
PORT=3000
NODE_ENV=development

# PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tiodavan

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Google Maps
GOOGLE_MAPS_API_KEY=

# WhatsApp (Z-API or Twilio)
WHATSAPP_INSTANCE_ID=
WHATSAPP_TOKEN=
```

---

## Code standards

- Use `class-validator` and `class-transformer` on all DTOs
- Apply `@UseGuards(FirebaseAuthGuard)` on all authenticated controllers
- Create a `@CurrentUser()` decorator to extract the authenticated user from the request
- Business errors must throw NestJS built-in exceptions (`NotFoundException`, `ForbiddenException`, `BadRequestException`, etc.)
- Run migrations with `prisma migrate dev` — never use `db push` in production
- Keep strict separation per module: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.dto.ts`
- All response bodies must go through response DTOs — never return raw Prisma objects to the client

---

## Out of scope for now

- Payments (future phase)
- Intelligent driver matching via ML (future phase)
- Admin web panel (out of server scope)
- Geofence logic (handled by the mobile app, which calls `POST /trips/:id/events`)
