-- ShiftSwap Database Schema
-- Run these commands in your Supabase SQL Editor

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  staff_id TEXT NOT NULL UNIQUE CHECK (staff_id ~ '^\d{4}$'),
  signature_blob TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create shifts table
CREATE TABLE shifts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poster_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Giveaway', 'Swap')),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  area TEXT NOT NULL CHECK (area IN ('Gaming', 'GPU', 'Bar')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Claimed', 'Completed', 'Uncompleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create swap_requests table
CREATE TABLE swap_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE NOT NULL,
  proposer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  proposer_shift_date DATE NOT NULL,
  proposer_start_time TIME NOT NULL,
  proposer_end_time TIME NOT NULL,
  proposer_area TEXT NOT NULL CHECK (proposer_area IN ('Gaming', 'GPU', 'Bar')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better query performance
CREATE INDEX idx_shifts_poster_id ON shifts(poster_id);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_swap_requests_shift_id ON swap_requests(shift_id);
CREATE INDEX idx_swap_requests_proposer_id ON swap_requests(proposer_id);
CREATE INDEX idx_swap_requests_status ON swap_requests(status);
CREATE INDEX idx_swap_requests_created_at ON swap_requests(created_at);

-- 6. Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, staff_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'staff_id', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swap_requests_updated_at BEFORE UPDATE ON swap_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 12. Create RLS policies for shifts
CREATE POLICY "Anyone can view shifts"
  ON shifts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create shifts"
  ON shifts FOR INSERT
  WITH CHECK (auth.uid() = poster_id);

CREATE POLICY "Poster can update own shifts"
  ON shifts FOR UPDATE
  USING (auth.uid() = poster_id);

CREATE POLICY "Poster can delete own shifts"
  ON shifts FOR DELETE
  USING (auth.uid() = poster_id);

-- 13. Create RLS policies for swap_requests
CREATE POLICY "Anyone can view swap requests"
  ON swap_requests FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create swap requests"
  ON swap_requests FOR INSERT
  WITH CHECK (auth.uid() = proposer_id);

CREATE POLICY "Proposer can update own requests"
  ON swap_requests FOR UPDATE
  USING (auth.uid() = proposer_id);

CREATE POLICY "Shift poster can update requests for their shifts"
  ON swap_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shifts
      WHERE shifts.id = swap_requests.shift_id
      AND shifts.poster_id = auth.uid()
    )
  );

-- 14. Create function to auto-delete old swap requests (7 days)
CREATE OR REPLACE FUNCTION delete_old_swap_requests()
RETURNS void AS $$
BEGIN
  DELETE FROM swap_requests
  WHERE status IN ('Accepted', 'Declined')
  AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Optional: Create a scheduled job to run cleanup daily
-- Note: This requires pg_cron extension which may need to be enabled in Supabase dashboard
-- You can also run this manually or via a cron job from your application
-- SELECT cron.schedule('delete-old-requests', '0 0 * * *', 'SELECT delete_old_swap_requests();');
