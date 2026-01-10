# Property Entity Gap Analysis Report

Here is the comprehensive audit of the "Property" entity, highlighting the critical mismatches between your backend schema and frontend forms.

## 1. Mismatch Report (Critical Issues)

| Field Name | Backend Model (`models.py`) | User UI (`my-listings/create`) | Admin UI (`admin/properties/create`) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **subtype** | `sub_type` | `subtype` (State Mismatch) | `sub_type` | 🔴 **CRITICAL PROPS MISMATCH** |
| **clubhouse** | `has_club_house` | `has_clubhouse` | `has_club_house` | 🔴 **CRITICAL PROPS MISMATCH** |
| **project_name** | `project_name` | Present | Present | ✅ |
| **whatsapp** | `whatsapp_number` | Present | Present | ✅ |
| **landmarks** | `landmarks` | Present | Present | ✅ |
| **facing** | `facing` | Present | Present | ✅ |
| **possession** | `possession_date` | Present | Present | ✅ |
| **age** | `age_of_construction` | Present | Present | ✅ |
| **floor_plan** | `PropertyFloorPlan` (Rel) | Handles Mulitple | Handles Multiple | ✅ (Moved to related model) |

### 🚨 Critical Errors Identified
1.  **Field Renaming Bug (User Form):** The User form stores the property sub-category in a state variable named `subtype`, but the backend expects `sub_type`. This will likely cause the sub-category to be ignored or error out upon submission.
2.  **Amenity Typo (User Form):** The User form uses `has_clubhouse`, but the backend model expects `has_club_house`. This amenity will silently fail to save.

## 2. Backend Schema Analysis (`src/apps/properties/models.py`)

**High-Value Unused Fields:**
*   `price_per_sqft`: Auto-calculated on save, so no UI needed, but good to display.
*   `verification_status`: Currently defaults to `PENDING`. Neither form allows setting this (correct for User, but Admin might want to override execution).
*   `video_url`: Present in models and state, but I didn't explicitly see the input field in the partial scan (verify it exists in the rendered JSX).

**Nullable Analysis:**
*   Most "Configuration" fields (`bhk_config`, `bathrooms`) have defaults.
*   "Location" text fields (`locality`, `city`) are NOT nullable (required). Frontend validation correctly handles this.

## 3. Frontend Form Audit

**User Form (`dashboard/my-listings/create`):**
*   **Strengths:** Good validation for 'required' fields (`title`, `price`, `area`).
*   **Weaknesses:** Contains the naming mismatches listed above.

**Admin Form (`admin/properties/create`):**
*   **Strengths:** Correctly uses `sub_type` and `has_club_house`.
*   **Consistency:** The Admin form is actually MORE accurate to the backend than the User form.

## 4. Recommendations & Fixes

### Immediate Fixes (Stop 500/Data Loss)
1.  **Rename State in User Form:** Change `subtype` -> `sub_type` in `src/app/dashboard/my-listings/create/page.tsx`.
2.  **Rename Amenity in User Form:** Change `has_clubhouse` -> `has_club_house` in `src/app/dashboard/my-listings/create/page.tsx`.

### UX Improvements
1.  **Add Video URL Input:** Ensure `video_url` input is actually rendered in the "Photos & Features" step (it's in the state but check JSX).
2.  **Admin Powers:** Add a "Verification Status" dropdown to the Admin create/edit form so they can instantly verify a property upon creation if needed.
3.  **Centralize Constants:** Move `PROPERTY_TYPES` and `AMENITIES` to a shared constant file (`src/constants/property.ts`) to prevent future drift between User and Admin forms.
