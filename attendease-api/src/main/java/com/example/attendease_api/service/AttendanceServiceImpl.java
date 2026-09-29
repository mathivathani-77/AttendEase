package com.example.attendease_api.service;

import com.example.attendease_api.model.Attendance;
import com.example.attendease_api.repo.AttendanceRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    @Override
    public Attendance markAttendance(Attendance attendance) {
        Optional<Attendance> existing = attendanceRepository
                .findByStudentIdAndDate(attendance.getStudentId(), attendance.getDate());
        if (existing.isPresent()) {
            Attendance record = existing.get();
            record.setStatus(attendance.getStatus());
            return attendanceRepository.save(record);
        }
        return attendanceRepository.save(attendance);
    }

    @Override
    public List<Attendance> getByClassroomAndDate(Long classroomId, LocalDate date) {
        return attendanceRepository.findByClassroomIdAndDate(classroomId, date);
    }

    @Override
    public List<Attendance> getByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    @Override
    public Map<String, Object> getStudentSummary(Long studentId) {
        List<Attendance> records = attendanceRepository.findByStudentId(studentId);
        long total = records.size();
        long present = records.stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                .count();
        double percentage = total == 0 ? 0 : (present * 100.0) / total;

        Map<String, Object> summary = new HashMap<>();
        summary.put("studentId", studentId);
        summary.put("totalDays", total);
        summary.put("presentDays", present);
        summary.put("absentDays", total - present);
        summary.put("attendancePercentage", percentage);
        return summary;
    }
}
