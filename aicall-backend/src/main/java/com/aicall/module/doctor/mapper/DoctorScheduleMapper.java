package com.aicall.module.doctor.mapper;

import com.aicall.module.doctor.entity.DoctorSchedule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface DoctorScheduleMapper {
    List<DoctorSchedule> findByDoctorIdAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
    List<DoctorSchedule> findRecentByDoctorId(@Param("doctorId") Long doctorId, @Param("limit") int limit);
    DoctorSchedule findById(@Param("id") Long id);
    void insert(DoctorSchedule schedule);
    void update(DoctorSchedule schedule);
    void delete(@Param("id") Long id);
}
