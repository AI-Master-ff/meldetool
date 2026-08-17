CREATE TABLE IF NOT EXISTS schools (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('GS', 'WF')),
  subtype TEXT,
  name TEXT NOT NULL,
  ort TEXT,
  sort_order INT NOT NULL,
  UNIQUE (type, name, ort)
);

CREATE TABLE IF NOT EXISTS slots (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('GS', 'WF')),
  section TEXT NOT NULL,
  group_label TEXT NOT NULL,
  sub_label TEXT,
  meta TEXT,
  sort_order INT NOT NULL,
  UNIQUE (type, group_label, sub_label)
);

CREATE TABLE IF NOT EXISTS entries (
  school_id INT NOT NULL REFERENCES schools (id) ON DELETE CASCADE,
  slot_id INT NOT NULL REFERENCES slots (id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (school_id, slot_id)
);
