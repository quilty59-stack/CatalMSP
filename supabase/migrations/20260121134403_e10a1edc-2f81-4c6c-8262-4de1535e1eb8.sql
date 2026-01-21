-- Allow anyone to delete MSP records
CREATE POLICY "Anyone can delete MSP"
ON public.msp
FOR DELETE
USING (true);

-- Also allow deleting associated photos when MSP is deleted
-- (already has delete policy, but let's ensure cascade behavior)